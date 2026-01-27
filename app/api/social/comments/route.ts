import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { containsBannedWords } from '@/lib/moderation'

const createCommentSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(['analysis', 'feed_item']),
  content: z.string().min(1).max(1000),
})

// POST - Create a comment
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { targetId, targetType, content } = parsed.data

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    if (containsBannedWords(content)) {
      return NextResponse.json(
        { error: 'El comentario contiene lenguaje inapropiado' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        authorId: profile.id,
        targetId,
        targetType,
        content,
      },
      include: {
        author: {
          select: {
            userId: true,
            displayName: true,
            avatarUrl: true,
            skillTier: true,
            user: { select: { name: true, image: true } },
          },
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

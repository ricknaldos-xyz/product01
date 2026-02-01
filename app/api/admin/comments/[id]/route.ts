import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

const toggleHideSchema = z.object({
  isHidden: z.boolean(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }
    const body = await request.json()
    const parsed = toggleHideSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.comment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { isHidden: parsed.data.isHidden },
      include: {
        author: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    logger.error('Toggle comment visibility error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar comentario' },
      { status: 500 }
    )
  }
}

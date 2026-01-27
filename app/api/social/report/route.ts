import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reportSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(['profile', 'comment', 'match_rating']),
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'HARASSMENT', 'FAKE_PROFILE', 'OTHER']),
  description: z.string().max(1000).optional(),
})

// POST - Report content
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = reportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { targetId, targetType, reason, description } = parsed.data

    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetId,
        targetType,
        reason,
        description,
      },
    })

    return NextResponse.json({ reported: true }, { status: 201 })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

const updateVerificationSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
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
    const parsed = updateVerificationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.coachProfile.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Coach no encontrado' }, { status: 404 })
    }

    const coach = await prisma.coachProfile.update({
      where: { id },
      data: {
        verificationStatus: parsed.data.status,
        verifiedAt: parsed.data.status === 'VERIFIED' ? new Date() : null,
      },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { students: true } },
      },
    })

    return NextResponse.json(coach)
  } catch (error) {
    logger.error('Update coach verification error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar verificacion del coach' },
      { status: 500 }
    )
  }
}

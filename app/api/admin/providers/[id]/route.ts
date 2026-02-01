import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().max(2000).optional().or(z.literal('')),
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
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.providerApplication.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (existing.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'Esta solicitud ya fue revisada' },
        { status: 400 }
      )
    }

    const application = await prisma.providerApplication.update({
      where: { id },
      data: {
        status: parsed.data.status,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: parsed.data.reviewNotes || null,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    // Notify the applicant
    const typeLabel = application.type === 'COURT' ? 'cancha' : 'taller'
    const isApproved = parsed.data.status === 'APPROVED'

    await createNotification({
      userId: application.userId,
      type: isApproved ? 'PROVIDER_APPROVED' : 'PROVIDER_REJECTED',
      title: isApproved
        ? `Solicitud de proveedor aprobada`
        : `Solicitud de proveedor rechazada`,
      body: isApproved
        ? `Tu solicitud para ser proveedor de ${typeLabel} (${application.businessName}) ha sido aprobada. Ya puedes gestionar tus ${application.type === 'COURT' ? 'canchas' : 'talleres'}.`
        : `Tu solicitud para ser proveedor de ${typeLabel} (${application.businessName}) ha sido rechazada.${parsed.data.reviewNotes ? ` Motivo: ${parsed.data.reviewNotes}` : ''}`,
      referenceId: application.id,
      referenceType: 'ProviderApplication',
    })

    return NextResponse.json(application)
  } catch (error) {
    logger.error('Admin provider review error:', error)
    return NextResponse.json(
      { error: 'Error al revisar solicitud de proveedor' },
      { status: 500 }
    )
  }
}

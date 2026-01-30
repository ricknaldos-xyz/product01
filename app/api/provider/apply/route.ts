import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import { z } from 'zod'

const applySchema = z.object({
  type: z.enum(['COURT', 'WORKSHOP']),
  businessName: z.string().min(2, 'Nombre del negocio requerido').max(200),
  businessPhone: z.string().min(6, 'Telefono requerido').max(20),
  businessEmail: z.string().email('Email invalido').optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  documentUrls: z.array(z.string().url()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = applySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, businessName, businessPhone, businessEmail, description, documentUrls } = parsed.data

    // Check if user already has an application for this type
    const existing = await prisma.providerApplication.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Ya tienes una solicitud de tipo ${type === 'COURT' ? 'cancha' : 'taller'}` },
        { status: 409 }
      )
    }

    const application = await prisma.providerApplication.create({
      data: {
        userId: session.user.id,
        type,
        status: 'PENDING_APPROVAL',
        businessName,
        businessPhone,
        businessEmail: businessEmail || null,
        description: description || null,
        documentUrls: documentUrls ?? [],
      },
    })

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    const typeLabel = type === 'COURT' ? 'Cancha' : 'Taller'
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'PROVIDER_APPLICATION_SUBMITTED',
          title: `Nueva solicitud de proveedor: ${typeLabel}`,
          body: `${session.user.name || session.user.email} ha solicitado ser proveedor de ${typeLabel.toLowerCase()}: ${businessName}`,
          referenceId: application.id,
          referenceType: 'ProviderApplication',
        })
      )
    )

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    logger.error('Provider apply error:', error)
    return NextResponse.json(
      { error: 'Error al enviar solicitud de proveedor' },
      { status: 500 }
    )
  }
}

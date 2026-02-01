import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  weeklyDigestEnabled: z.boolean().optional(),
  reminderTime: z.string().nullable().optional(),
  name: z.string().min(2).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSettingsSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const { emailNotifications, weeklyDigestEnabled, reminderTime, name } = validated.data

    // Validate reminderTime format if provided
    if (reminderTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(reminderTime)) {
      return NextResponse.json(
        { error: 'Formato de hora invalido. Usa HH:mm' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(weeklyDigestEnabled !== undefined && { weeklyDigestEnabled }),
        ...(reminderTime !== undefined && { reminderTime }),
        ...(name && { name }),
      },
      select: {
        id: true,
        name: true,
        emailNotifications: true,
        weeklyDigestEnabled: true,
        reminderTime: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    logger.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuracion' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailNotifications: true,
        weeklyDigestEnabled: true,
        reminderTime: true,
        subscription: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    logger.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuracion' },
      { status: 500 }
    )
  }
}

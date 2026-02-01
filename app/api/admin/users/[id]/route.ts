import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

const updateUserSchema = z.object({
  action: z.enum(['ban', 'unban', 'suspend', 'update']).optional(),
  role: z.enum(['USER', 'COACH', 'ADMIN']).optional(),
  subscription: z.enum(['FREE', 'PRO', 'ELITE']).optional(),
  accountType: z.enum(['PLAYER', 'COACH']).optional(),
  suspendedUntil: z.string().optional(),
})

export async function GET(
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

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        playerProfile: true,
        coachProfile: true,
        _count: {
          select: {
            analyses: true,
            trainingPlans: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    logger.error('Admin user detail error:', error)
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
  }
}

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

    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { action, role, subscription, accountType, suspendedUntil } = parsed.data
    const effectiveAction = action || 'update'

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: Record<string, any> = {}

    switch (effectiveAction) {
      case 'ban': {
        if (id === session.user.id) {
          return NextResponse.json(
            { error: 'No puedes banearte a ti mismo' },
            { status: 400 }
          )
        }
        data.bannedAt = new Date()
        break
      }
      case 'unban': {
        data.bannedAt = null
        break
      }
      case 'suspend': {
        if (!suspendedUntil) {
          return NextResponse.json(
            { error: 'Se requiere la fecha de suspension (suspendedUntil)' },
            { status: 400 }
          )
        }
        if (id === session.user.id) {
          return NextResponse.json(
            { error: 'No puedes suspenderte a ti mismo' },
            { status: 400 }
          )
        }
        const suspendDate = new Date(suspendedUntil)
        if (isNaN(suspendDate.getTime()) || suspendDate <= new Date()) {
          return NextResponse.json(
            { error: 'La fecha de suspension debe ser una fecha futura valida' },
            { status: 400 }
          )
        }
        data.suspendedUntil = suspendDate
        break
      }
      case 'update':
      default: {
        // Prevent admin from removing their own admin role
        if (role && id === session.user.id && role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'No puedes cambiar tu propio rol de administrador' },
            { status: 400 }
          )
        }

        if (role) data.role = role
        if (subscription) data.subscription = subscription
        if (accountType) data.accountType = accountType

        if (Object.keys(data).length === 0) {
          return NextResponse.json(
            { error: 'No se proporcionaron campos para actualizar' },
            { status: 400 }
          )
        }
        break
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountType: true,
        subscription: true,
        bannedAt: true,
        suspendedUntil: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    logger.info(`Admin ${session.user.email} ${effectiveAction} user ${id}:`, data)

    return NextResponse.json(updatedUser)
  } catch (error) {
    logger.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

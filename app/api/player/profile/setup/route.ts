import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const setupSchema = z.object({
  displayName: z.string().min(2).max(50),
  region: z.string().min(1, 'Selecciona tu departamento'),
  city: z.string().min(1, 'Selecciona tu ciudad'),
  playStyle: z.string().optional(),
  dominantHand: z.enum(['right', 'left']).optional(),
  backhandType: z.enum(['one-handed', 'two-handed']).optional(),
  yearsPlaying: z.number().int().min(0).max(80).optional(),
  ageGroup: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
})

// POST - Initial profile setup (creates or updates)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = setupSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const profile = await prisma.playerProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...validated.data,
        country: 'PE',
      },
      update: validated.data,
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    logger.error('Profile setup error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

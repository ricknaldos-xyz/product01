import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createClubSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  city: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
  maxMembers: z.number().int().min(5).max(200).optional().default(50),
})

// POST - Create a club
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createClubSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, country: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const slug = validated.data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '-' + Date.now().toString(36)

    const club = await prisma.club.create({
      data: {
        ...validated.data,
        slug,
        ownerId: profile.id,
        country: profile.country,
        members: {
          create: {
            profileId: profile.id,
            role: 'owner',
          },
        },
      },
    })

    return NextResponse.json(club, { status: 201 })
  } catch (error) {
    logger.error('Create club error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// GET - List clubs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || 'PE'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where: { country, isPublic: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { members: true } },
          owner: {
            select: { displayName: true, avatarUrl: true },
          },
        },
      }),
      prisma.club.count({ where: { country, isPublic: true } }),
    ])

    return NextResponse.json({
      clubs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('List clubs error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

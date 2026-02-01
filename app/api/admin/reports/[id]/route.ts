import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

const resolveReportSchema = z.object({
  action: z.enum(['warn', 'hide_content', 'ban_user', 'dismiss']),
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
    const parsed = resolveReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    }

    if (report.resolved) {
      return NextResponse.json({ error: 'Este reporte ya fue resuelto' }, { status: 400 })
    }

    const { action } = parsed.data
    const now = new Date()

    // Execute action
    if (action === 'hide_content') {
      if (report.targetType === 'comment') {
        await prisma.comment.update({
          where: { id: report.targetId },
          data: { isHidden: true },
        })
      }
    } else if (action === 'ban_user') {
      const targetProfile = await prisma.playerProfile.findUnique({
        where: { id: report.targetId },
        select: { userId: true },
      })

      if (targetProfile) {
        await prisma.user.update({
          where: { id: targetProfile.userId },
          data: { bannedAt: now },
        })
      }
    }

    // Mark report as resolved
    const resolvedReport = await prisma.report.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAction: action === 'dismiss' ? 'dismissed' : action,
        resolvedAt: now,
        resolvedById: session.user.id,
      },
      include: {
        reporter: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        target: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(resolvedReport)
  } catch (error) {
    logger.error('Resolve report error:', error)
    return NextResponse.json(
      { error: 'Error al resolver reporte' },
      { status: 500 }
    )
  }
}

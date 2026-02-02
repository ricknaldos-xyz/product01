import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock'
import { logger } from '@/lib/logger'
import { timingSafeCompare } from '@/lib/validation'
import { sendEmail } from '@/lib/email'

// POST - Send weekly digest emails to active users
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!authHeader || !timingSafeCompare(authHeader, expected)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locked = await acquireCronLock('weekly-digest')
    if (!locked) {
      return NextResponse.json({ message: 'Job already running' }, { status: 200 })
    }

    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      // Find users who have opted in to weekly digest
      const activeUsers = await prisma.user.findMany({
        where: {
          emailVerified: { not: null },
          emailNotifications: true,
          weeklyDigestEnabled: true,
          playerProfile: { isNot: null },
        },
        select: {
          id: true,
          name: true,
          email: true,
          playerProfile: { select: { id: true } },
        },
        take: 500,
      })

      let sent = 0

      for (const user of activeUsers) {
        if (!user.email) continue

        const profileId = user.playerProfile?.id

        // Get user's weekly stats
        const [analysesCount, matchesCount, streakData] = await Promise.all([
          prisma.analysis.count({
            where: { userId: user.id, createdAt: { gte: oneWeekAgo }, status: 'COMPLETED' },
          }),
          profileId
            ? prisma.match.count({
                where: {
                  OR: [
                    { player1Id: profileId, createdAt: { gte: oneWeekAgo } },
                    { player2Id: profileId, createdAt: { gte: oneWeekAgo } },
                  ],
                },
              })
            : Promise.resolve(0),
          prisma.userStreak.findUnique({
            where: { userId: user.id },
            select: { currentStreak: true },
          }),
        ])

        // Get ranking change
        let rankChange: number | null = null
        if (profileId) {
          const ranking = await prisma.ranking.findFirst({
            where: { profileId, period: 'ALL_TIME', category: 'COUNTRY' },
            select: { rank: true, previousRank: true },
          })
          if (ranking?.rank && ranking?.previousRank) {
            rankChange = ranking.previousRank - ranking.rank
          }
        }

        // Get upcoming tournaments
        const tournaments = await prisma.tournament.findMany({
          where: {
            status: 'REGISTRATION',
            registrationEnd: { gte: new Date() },
          },
          select: { name: true, startDate: true },
          take: 2,
          orderBy: { startDate: 'asc' },
        })

        // Skip if nothing to report
        if (analysesCount === 0 && matchesCount === 0 && !rankChange && tournaments.length === 0) {
          continue
        }

        const html = getWeeklyDigestHtml({
          name: user.name || 'Deportista',
          analysesCount,
          matchesCount,
          currentStreak: streakData?.currentStreak || 0,
          rankChange,
          tournaments: tournaments.map((t) => ({
            name: t.name,
            date: t.startDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
          })),
        })

        try {
          await sendEmail({
            to: user.email,
            subject: 'Tu resumen semanal - SportTek',
            html,
          })
          sent++
        } catch {
          // Continue with other users if one fails
        }
      }

      logger.info(`Weekly digest sent to ${sent} users`)
      return NextResponse.json({ message: `Sent ${sent} digest emails` })
    } finally {
      await releaseCronLock('weekly-digest')
    }
  } catch (error) {
    logger.error('Weekly digest cron error:', error)
    return NextResponse.json(
      { error: 'Error sending weekly digest' },
      { status: 500 }
    )
  }
}

function getWeeklyDigestHtml(data: {
  name: string
  analysesCount: number
  matchesCount: number
  currentStreak: number
  rankChange: number | null
  tournaments: Array<{ name: string; date: string }>
}) {
  const statsRows = []

  if (data.analysesCount > 0) {
    statsRows.push(`<tr><td style="padding: 8px 0; color: #3f3f46;">Analisis completados</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #256F50;">${data.analysesCount}</td></tr>`)
  }
  if (data.matchesCount > 0) {
    statsRows.push(`<tr><td style="padding: 8px 0; color: #3f3f46;">Partidos jugados</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #256F50;">${data.matchesCount}</td></tr>`)
  }
  if (data.currentStreak > 0) {
    statsRows.push(`<tr><td style="padding: 8px 0; color: #3f3f46;">Racha actual</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f97316;">${data.currentStreak} dias 🔥</td></tr>`)
  }
  if (data.rankChange !== null) {
    const arrow = data.rankChange > 0 ? '↑' : data.rankChange < 0 ? '↓' : '→'
    const color = data.rankChange > 0 ? '#22c55e' : data.rankChange < 0 ? '#ef4444' : '#71717a'
    statsRows.push(`<tr><td style="padding: 8px 0; color: #3f3f46;">Cambio en ranking</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${color};">${arrow} ${Math.abs(data.rankChange)} posiciones</td></tr>`)
  }

  const tournamentsHtml = data.tournaments.length > 0
    ? `<div style="margin-top: 24px;">
        <h3 style="color: #18181b; font-size: 16px; margin: 0 0 12px 0;">Torneos disponibles</h3>
        ${data.tournaments.map((t) => `<div style="background-color: #f4f4f5; border-radius: 8px; padding: 12px; margin-bottom: 8px;"><strong>${t.name}</strong><br><span style="color: #71717a; font-size: 14px;">${t.date}</span></div>`).join('')}
      </div>`
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu resumen semanal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #18181b; font-size: 24px; margin: 0;">Tu Resumen Semanal</h1>
        <p style="color: #71717a; font-size: 14px; margin: 8px 0 0 0;">Asi fue tu semana en SportTek</p>
      </div>

      <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Hola ${data.name},
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${statsRows.join('')}
      </table>

      ${tournamentsHtml}

      <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #256F50; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ir a SportTek
        </a>
      </div>

      <p style="color: #71717a; font-size: 14px; text-align: center;">
        Sigue mejorando tu tecnica. Cada analisis cuenta.
      </p>
    </div>

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
      &copy; ${new Date().getFullYear()} SportTek. Todos los derechos reservados.
      <br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/settings" style="color: #a1a1aa; text-decoration: underline;">
        Desactivar resumen semanal
      </a>
    </p>
  </div>
</body>
</html>
`
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const analysisId = request.nextUrl.searchParams.get('analysisId')
    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId requerido' }, { status: 400 })
    }

    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId: session.user.id },
      include: {
        issues: { select: { severity: true } },
        technique: { select: { name: true } },
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analisis no encontrado' }, { status: 404 })
    }

    const issues = analysis.issues
    const critical = issues.filter(i => i.severity === 'CRITICAL').length
    const high = issues.filter(i => i.severity === 'HIGH').length
    const medium = issues.filter(i => i.severity === 'MEDIUM').length
    const low = issues.filter(i => i.severity === 'LOW').length

    // Recommend duration based on severity distribution
    let recommendedWeeks: number
    if (critical > 0 || high >= 2) {
      recommendedWeeks = 6
    } else if (high >= 1 || medium >= 2) {
      recommendedWeeks = 4
    } else {
      recommendedWeeks = 2
    }

    return NextResponse.json({
      recommendedWeeks,
      techniqueName: analysis.technique.name,
      issuesSummary: { critical, high, medium, low, total: issues.length },
    })
  } catch (error) {
    logger.error('Recommend error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

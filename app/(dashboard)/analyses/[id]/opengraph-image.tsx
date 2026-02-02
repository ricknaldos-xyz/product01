import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const alt = 'Analisis SportTek'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let score = 0
  let techniqueName = 'Tecnica'
  let sportName = 'Deporte'

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        overallScore: true,
        technique: { select: { name: true, sport: { select: { name: true } } } },
      },
    })
    if (analysis) {
      score = analysis.overallScore || 0
      techniqueName = analysis.technique.name
      sportName = analysis.technique.sport.name
    }
  } catch {
    // Use defaults
  }

  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(232, 99, 43, 0.12)',
            display: 'flex',
          }}
        />

        {/* Sport + Technique */}
        <div style={{ fontSize: 22, color: '#64748b', marginBottom: 16, display: 'flex' }}>
          {sportName} — {techniqueName}
        </div>

        {/* Score circle */}
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: `6px solid ${scoreColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 800, color: scoreColor, display: 'flex' }}>
            {score}
          </span>
          <span style={{ fontSize: 16, color: '#94a3b8', display: 'flex' }}>Skill Score</span>
        </div>

        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <span style={{ fontSize: 18, color: '#64748b', display: 'flex' }}>
            Analizado con
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', display: 'flex' }}>
            🎯 SportTek
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}

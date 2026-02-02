import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const alt = 'Perfil de Jugador SportTek'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params

  let displayName = 'Jugador'
  let skillTier = 'UNRANKED'
  let compositeScore = 0

  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        displayName: true,
        skillTier: true,
        compositeScore: true,
        showRealName: true,
        user: { select: { name: true } },
      },
    })
    if (profile) {
      displayName = profile.showRealName
        ? (profile.displayName || profile.user.name || 'Jugador')
        : (profile.displayName || 'Jugador')
      skillTier = profile.skillTier
      compositeScore = profile.compositeScore ?? 0
    }
  } catch {
    // Use defaults
  }

  const scoreColor = compositeScore >= 80 ? '#22c55e' : compositeScore >= 60 ? '#f59e0b' : compositeScore >= 40 ? '#f97316' : '#E8632B'

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

        {/* Player name */}
        <div style={{ fontSize: 42, fontWeight: 700, color: '#ffffff', marginBottom: 8, display: 'flex' }}>
          {displayName}
        </div>

        {/* Tier */}
        <div style={{ fontSize: 20, color: '#64748b', marginBottom: 24, display: 'flex' }}>
          {skillTier.replace('_', ' ')}
        </div>

        {/* Score circle */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: `5px solid ${scoreColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 800, color: scoreColor, display: 'flex' }}>
            {compositeScore}
          </span>
          <span style={{ fontSize: 14, color: '#94a3b8', display: 'flex' }}>Skill Score</span>
        </div>

        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', display: 'flex' }}>
            🎯 SportTek
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}

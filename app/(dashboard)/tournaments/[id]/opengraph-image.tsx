import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const alt = 'Torneo SportTek'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let name = 'Torneo SportTek'
  let date = ''
  let sportName = ''
  let playerCount = 0

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        name: true,
        startDate: true,
        sport: { select: { name: true } },
        _count: { select: { participants: true } },
      },
    })
    if (tournament) {
      name = tournament.name
      date = tournament.startDate.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      sportName = tournament.sport?.name ?? ''
      playerCount = tournament._count.participants
    }
  } catch {
    // Use defaults
  }

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
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(232, 99, 43, 0.1)',
            display: 'flex',
          }}
        />

        {/* Trophy */}
        <div style={{ fontSize: 64, marginBottom: 16, display: 'flex' }}>🏆</div>

        {/* Tournament name */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.2,
            marginBottom: 16,
            display: 'flex',
          }}
        >
          {name}
        </div>

        {/* Info pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {sportName && (
            <div
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                background: 'rgba(232, 99, 43, 0.2)',
                border: '1px solid rgba(232, 99, 43, 0.3)',
                color: '#FDBA74',
                fontSize: 18,
                display: 'flex',
              }}
            >
              {sportName}
            </div>
          )}
          {date && (
            <div
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                fontSize: 18,
                display: 'flex',
              }}
            >
              {date}
            </div>
          )}
          {playerCount > 0 && (
            <div
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                fontSize: 18,
                display: 'flex',
              }}
            >
              {playerCount} jugadores
            </div>
          )}
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: '#64748b', display: 'flex' }}>
            🎯 SportTek
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}

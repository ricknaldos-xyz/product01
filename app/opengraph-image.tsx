import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'SportTek - Analisis Deportivo con IA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(232, 99, 43, 0.15)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(232, 99, 43, 0.1)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #E8632B 0%, #F07B3F 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            🎯
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            SportTek
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Tu carrera deportiva en una sola plataforma
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['Analisis IA', 'Rankings', 'Torneos', 'Matchmaking', 'Coaches'].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '10px 24px',
                borderRadius: 999,
                background: 'rgba(232, 99, 43, 0.2)',
                border: '1px solid rgba(232, 99, 43, 0.3)',
                color: '#FDBA74',
                fontSize: 18,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Sports */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 32,
            fontSize: 20,
            color: '#64748b',
          }}
        >
          <span style={{ display: 'flex' }}>🎾 Tenis</span>
          <span style={{ display: 'flex' }}>🏓 Padel</span>
        </div>
      </div>
    ),
    { ...size }
  )
}

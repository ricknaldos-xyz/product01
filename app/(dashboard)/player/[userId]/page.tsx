import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>
}): Promise<Metadata> {
  const { userId } = await params
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    select: { displayName: true, skillTier: true },
  })

  const name = profile?.displayName || 'Jugador'
  return {
    title: `${name} - Perfil de Jugador | SportTek`,
    description: `Perfil publico de ${name} en SportTek. Consulta su Skill Score y estadisticas.`,
  }
}
import { GlassCard } from '@/components/ui/glass-card'
import { TierBadge } from '@/components/player/TierBadge'
import { SkillScoreDisplay } from '@/components/player/SkillScoreDisplay'
import { TechniqueRadarChart } from '@/components/player/TechniqueRadarChart'
import { MapPin, Calendar, Hand, Trophy, Target } from 'lucide-react'

export default async function PublicPlayerProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params

  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, image: true },
      },
      techniqueScores: {
        include: {
          technique: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { bestScore: 'desc' },
      },
    },
  })

  if (!profile || profile.visibility === 'PRIVATE') {
    notFound()
  }

  const displayName = profile.showRealName
    ? (profile.displayName || profile.user.name || 'Jugador')
    : (profile.displayName?.charAt(0) + '***')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Perfil de Jugador</h1>
        <TierBadge tier={profile.skillTier} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score */}
        <GlassCard intensity="light" padding="lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">Skill Score</h3>
          <SkillScoreDisplay score={profile.compositeScore} tier={profile.skillTier} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="glass-ultralight rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{profile.totalAnalyses}</p>
              <p className="text-xs text-muted-foreground">Analisis</p>
            </div>
            <div className="glass-ultralight rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{profile.totalTechniques}</p>
              <p className="text-xs text-muted-foreground">Tecnicas</p>
            </div>
          </div>
          {profile.countryRank && (
            <div className="mt-3 glass-ultralight rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="font-bold">#{profile.countryRank}</span>
              </div>
              <p className="text-xs text-muted-foreground">Ranking Peru</p>
            </div>
          )}
        </GlassCard>

        {/* Info */}
        <GlassCard intensity="light" padding="lg" className="md:col-span-2">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile.avatarUrl || profile.user.image ? (
                <Image
                  src={profile.avatarUrl || profile.user.image || ''}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{displayName}</h2>
              {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
              <div className="flex flex-wrap gap-3 mt-2">
                {profile.showLocation && (profile.region || profile.city) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[profile.city, profile.region].filter(Boolean).join(', ')}
                  </span>
                )}
                {profile.yearsPlaying && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {profile.yearsPlaying} anos jugando
                  </span>
                )}
                {profile.dominantHand && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hand className="h-3 w-3" />
                    {profile.dominantHand === 'right' ? 'Diestro' : 'Zurdo'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {profile.playStyle && (
              <div className="glass-ultralight rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Estilo</p>
                <p className="text-sm font-medium mt-0.5">{profile.playStyle}</p>
              </div>
            )}
            <div className="glass-ultralight rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Partidos</p>
              <p className="text-sm font-medium mt-0.5">{profile.matchesPlayed}</p>
            </div>
            <div className="glass-ultralight rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Ganados</p>
              <p className="text-sm font-medium mt-0.5">{profile.matchesWon}</p>
            </div>
            <div className="glass-ultralight rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Seguidores</p>
              <p className="text-sm font-medium mt-0.5">{profile.followersCount}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Radar */}
      {profile.techniqueScores.length >= 3 && (
        <GlassCard intensity="light" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Radar de Tecnicas</h3>
          </div>
          <TechniqueRadarChart data={profile.techniqueScores} />
        </GlassCard>
      )}

      {/* Technique Scores */}
      {profile.techniqueScores.length > 0 && (
        <GlassCard intensity="light" padding="lg">
          <h3 className="font-semibold mb-4">Tecnicas</h3>
          <div className="space-y-3">
            {profile.techniqueScores.map((ts) => (
              <div key={ts.id} className="flex items-center gap-4 glass-ultralight rounded-xl p-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{ts.technique.name}</p>
                  <p className="text-xs text-muted-foreground">{ts.analysisCount} analisis</p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums">{ts.bestScore.toFixed(1)}</p>
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${ts.bestScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}

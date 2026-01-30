import { BadgeType } from '@prisma/client'

export interface BadgeDefinition {
  type: BadgeType
  name: string
  description: string
  icon: string
  color: string
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  FIRST_ANALYSIS: {
    type: 'FIRST_ANALYSIS',
    name: 'Primer Analisis',
    description: 'Completa tu primer analisis de tecnica',
    icon: '🎯',
    color: 'bg-blue-100 text-blue-700',
  },
  WEEK_PERFECT: {
    type: 'WEEK_PERFECT',
    name: 'Semana Perfecta',
    description: '7 dias consecutivos de actividad',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-700',
  },
  PLAN_COMPLETED: {
    type: 'PLAN_COMPLETED',
    name: 'Plan Completado',
    description: 'Termina un plan de entrenamiento completo',
    icon: '🏆',
    color: 'bg-purple-100 text-purple-700',
  },
  IMPROVEMENT: {
    type: 'IMPROVEMENT',
    name: 'Mejora Visible',
    description: 'Tu score subio 1+ puntos en la misma tecnica',
    icon: '📈',
    color: 'bg-green-100 text-green-700',
  },
  DEDICATION_30: {
    type: 'DEDICATION_30',
    name: 'Dedicacion',
    description: '30 dias de actividad total',
    icon: '💪',
    color: 'bg-orange-100 text-orange-700',
  },
  STREAK_7: {
    type: 'STREAK_7',
    name: 'Racha de 7',
    description: 'Alcanza una racha de 7 dias',
    icon: '🔥',
    color: 'bg-red-100 text-red-700',
  },
  STREAK_30: {
    type: 'STREAK_30',
    name: 'Racha de 30',
    description: 'Alcanza una racha de 30 dias',
    icon: '🔥🔥',
    color: 'bg-red-100 text-red-700',
  },
  STREAK_100: {
    type: 'STREAK_100',
    name: 'Racha Legendaria',
    description: 'Alcanza una racha de 100 dias',
    icon: '🔥🔥🔥',
    color: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700',
  },
  // Competition & Community badges
  FIRST_CHALLENGE: {
    type: 'FIRST_CHALLENGE',
    name: 'Primer Desafio',
    description: 'Envia tu primer desafio a otro jugador',
    icon: '⚔️',
    color: 'bg-indigo-100 text-indigo-700',
  },
  FIRST_MATCH: {
    type: 'FIRST_MATCH',
    name: 'Primer Partido',
    description: 'Completa tu primer partido registrado',
    icon: '🎾',
    color: 'bg-green-100 text-green-700',
  },
  TEN_MATCHES: {
    type: 'TEN_MATCHES',
    name: '10 Partidos',
    description: 'Juega 10 partidos registrados',
    icon: '🏅',
    color: 'bg-blue-100 text-blue-700',
  },
  FIFTY_MATCHES: {
    type: 'FIFTY_MATCHES',
    name: '50 Partidos',
    description: 'Juega 50 partidos registrados',
    icon: '🥇',
    color: 'bg-yellow-100 text-yellow-700',
  },
  TIER_QUINTA: {
    type: 'TIER_QUINTA',
    name: '5ta Categoria',
    description: 'Alcanza la 5ta Categoria',
    icon: '🎾',
    color: 'bg-amber-100 text-amber-700',
  },
  TIER_CUARTA: {
    type: 'TIER_CUARTA',
    name: '4ta Categoria',
    description: 'Alcanza la 4ta Categoria',
    icon: '🥉',
    color: 'bg-yellow-100 text-yellow-700',
  },
  TIER_TERCERA: {
    type: 'TIER_TERCERA',
    name: '3ra Categoria',
    description: 'Alcanza la 3ra Categoria',
    icon: '🥈',
    color: 'bg-emerald-100 text-emerald-700',
  },
  TIER_SEGUNDA: {
    type: 'TIER_SEGUNDA',
    name: '2da Categoria',
    description: 'Alcanza la 2da Categoria',
    icon: '🥇',
    color: 'bg-cyan-100 text-cyan-700',
  },
  TIER_PRIMERA: {
    type: 'TIER_PRIMERA',
    name: '1ra Categoria',
    description: 'Alcanza la 1ra Categoria - elite del tenis amateur',
    icon: '🏆',
    color: 'bg-violet-100 text-violet-700',
  },
  TOP_100_COUNTRY: {
    type: 'TOP_100_COUNTRY',
    name: 'Top 100 Nacional',
    description: 'Entra al top 100 de tu pais',
    icon: '🏆',
    color: 'bg-emerald-100 text-emerald-700',
  },
  TOP_10_COUNTRY: {
    type: 'TOP_10_COUNTRY',
    name: 'Top 10 Nacional',
    description: 'Entra al top 10 de tu pais',
    icon: '👑',
    color: 'bg-amber-100 text-amber-700',
  },
  NUMBER_ONE_COUNTRY: {
    type: 'NUMBER_ONE_COUNTRY',
    name: 'Numero 1',
    description: 'Alcanza el puesto #1 de tu pais',
    icon: '🏆👑',
    color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700',
  },
  FIRST_FOLLOWER: {
    type: 'FIRST_FOLLOWER',
    name: 'Primer Seguidor',
    description: 'Alguien empezo a seguir tu perfil',
    icon: '👥',
    color: 'bg-sky-100 text-sky-700',
  },
  CLUB_FOUNDER: {
    type: 'CLUB_FOUNDER',
    name: 'Fundador de Club',
    description: 'Crea tu propio club de tenis',
    icon: '🏛️',
    color: 'bg-purple-100 text-purple-700',
  },
  COACH_CERTIFIED: {
    type: 'COACH_CERTIFIED',
    name: 'Entrenador Certificado',
    description: 'Tu perfil de entrenador fue verificado',
    icon: '✅',
    color: 'bg-teal-100 text-teal-700',
  },
  TOURNAMENT_WINNER: {
    type: 'TOURNAMENT_WINNER',
    name: 'Campeon de Torneo',
    description: 'Gana un torneo',
    icon: '🏆',
    color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700',
  },
  TOURNAMENT_FINALIST: {
    type: 'TOURNAMENT_FINALIST',
    name: 'Finalista de Torneo',
    description: 'Llega a la final de un torneo',
    icon: '🥈',
    color: 'bg-slate-100 text-slate-700',
  },
  FIRST_TOURNAMENT: {
    type: 'FIRST_TOURNAMENT',
    name: 'Primer Torneo',
    description: 'Participa en tu primer torneo',
    icon: '🎪',
    color: 'bg-pink-100 text-pink-700',
  },
}

export function getBadgeDefinition(type: BadgeType): BadgeDefinition {
  return BADGE_DEFINITIONS[type]
}

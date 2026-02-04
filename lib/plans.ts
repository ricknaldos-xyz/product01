export const PLANS = {
  FREE: {
    name: 'Descubre tu nivel',
    description: 'Prueba el poder del analisis IA',
    price: 0,
    features: [
      '5 analisis por mes',
      '1 plan de entrenamiento activo',
      'Acceso a Tenis',
      'Ranking nacional basico',
      'Perfil de jugador',
      'Soporte por email',
    ],
    limits: {
      analysesPerMonth: 5,
      activePlans: 1,
    },
  },
  PRO: {
    name: 'Compite en serio',
    description: 'Todo lo que necesitas para mejorar cada semana',
    price: 24.90,
    features: [
      'Analisis ilimitados de video',
      'Planes de entrenamiento ilimitados',
      'Tenis y Padel',
      'Rankings completos (tier, edad, pais)',
      'Historial de progreso y estadisticas',
      'Matchmaking y desafios',
      'Torneos y badges',
      'Soporte prioritario',
    ],
    limits: {
      analysesPerMonth: -1,
      activePlans: -1,
    },
  },
  ELITE: {
    name: 'Entrena como profesional',
    description: 'Acceso total con herramientas avanzadas',
    price: 39.90,
    features: [
      'Todo en Pro',
      'Analisis en calidad HD',
      'Comparacion de progreso entre analisis',
      'Exportar informes para imprimir',
      'Acceso anticipado a nuevas funciones',
      'Badge Elite en tu perfil',
      'Soporte prioritario',
    ],
    limits: {
      analysesPerMonth: -1,
      activePlans: -1,
    },
  },
} as const

export type PlanType = keyof typeof PLANS

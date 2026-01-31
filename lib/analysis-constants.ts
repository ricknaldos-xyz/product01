// Shared constants for analysis components

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  posture: { label: 'Postura', icon: '🧍' },
  timing: { label: 'Timing', icon: '⏱️' },
  balance: { label: 'Equilibrio', icon: '⚖️' },
  grip: { label: 'Agarre', icon: '✊' },
  footwork: { label: 'Juego de pies', icon: '👣' },
  swing: { label: 'Swing', icon: '🏌️' },
  followthrough: { label: 'Seguimiento', icon: '➡️' },
  contact: { label: 'Contacto', icon: '🎯' },
  toss: { label: 'Lanzamiento', icon: '🔝' },
  rotation: { label: 'Rotacion', icon: '🔄' },
  preparation: { label: 'Preparacion', icon: '🏗️' },
}

export function getCategoryLabel(category: string): { label: string; icon: string } {
  return CATEGORY_LABELS[category] ?? {
    label: category.charAt(0).toUpperCase() + category.slice(1),
    icon: '📋',
  }
}

export const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critico', variant: 'destructive' as const, weight: 4, color: 'text-red-500' },
  HIGH: { label: 'Alto', variant: 'warning' as const, weight: 3, color: 'text-orange-500' },
  MEDIUM: { label: 'Medio', variant: 'warning' as const, weight: 2, color: 'text-yellow-500' },
  LOW: { label: 'Bajo', variant: 'primary' as const, weight: 1, color: 'text-blue-500' },
} as const

export type Severity = keyof typeof SEVERITY_CONFIG

export function getScoreColor(score: number): string {
  if (score >= 9) return 'text-emerald-500'
  if (score >= 7) return 'text-green-500'
  if (score >= 5) return 'text-yellow-500'
  return 'text-red-500'
}

export function getScoreRingColor(score: number): string {
  if (score >= 9) return '#10b981' // emerald-500
  if (score >= 7) return '#22c55e' // green-500
  if (score >= 5) return '#eab308' // yellow-500
  return '#ef4444' // red-500
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excelente'
  if (score >= 8) return 'Muy bueno'
  if (score >= 7) return 'Bueno'
  if (score >= 6) return 'Promedio'
  if (score >= 5) return 'En desarrollo'
  return 'Necesita trabajo'
}

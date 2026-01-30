import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const TEMPLATES = [
  { type: 'TECHNIQUE', label: 'Dominar el saque', techniqueSlug: 'saque', icon: 'zap' },
  { type: 'TECHNIQUE', label: 'Mejorar mi derecha', techniqueSlug: 'derecha', icon: 'target' },
  { type: 'TECHNIQUE', label: 'Mejorar mi revés', techniqueSlug: 'reves', icon: 'target' },
  { type: 'TECHNIQUE', label: 'Juego de red completo', techniqueSlugs: ['volea', 'remate', 'golpe-de-aproximacion'], icon: 'layers' },
  { type: 'SCORE_TARGET', label: 'Alcanzar 8/10', targetScore: 8, icon: 'trophy' },
  { type: 'TIER_TARGET', label: 'Llegar a Oro', targetTier: 'ORO', icon: 'medal' },
  { type: 'TIER_TARGET', label: 'Llegar a Platino', targetTier: 'PLATINO', icon: 'medal' },
] as const

// GET - Get predefined goal templates
export async function GET() {
  try {
    // Fetch all techniques to resolve slugs to IDs
    const techniques = await prisma.technique.findMany({
      select: { id: true, slug: true, name: true, sport: { select: { id: true, name: true } } },
    })

    const slugToTechnique = new Map(techniques.map((t) => [t.slug, t]))

    const templates = TEMPLATES.map((template) => {
      // Resolve technique slug(s) to IDs
      let techniqueIds: string[] = []

      if ('techniqueSlugs' in template) {
        techniqueIds = template.techniqueSlugs
          .map((slug) => slugToTechnique.get(slug)?.id)
          .filter((id): id is string => id != null)
      } else if ('techniqueSlug' in template) {
        const technique = slugToTechnique.get(template.techniqueSlug)
        if (technique) {
          techniqueIds = [technique.id]
        }
      }

      return {
        type: template.type,
        label: template.label,
        icon: template.icon,
        techniqueIds,
        ...('targetScore' in template ? { targetScore: template.targetScore } : {}),
        ...('targetTier' in template ? { targetTier: template.targetTier } : {}),
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    logger.error('Get goal templates error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

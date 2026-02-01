import { prisma } from '@/lib/prisma'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

// Smart recommendation engine: uses sport, technique, issues, and score
function getRecommendationStrategy(
  sportName: string,
  techniqueName: string,
  issues: Array<{ category: string; severity: string }>,
  score: number | null
): { categories: string[]; reason: string } {
  const lower = techniqueName.toLowerCase()
  const sportLower = sportName.toLowerCase()
  const categories: string[] = []
  let reason = 'Para tu deporte'

  // Analyze issues to determine categories
  const issueCategories = issues.map((i) => i.category.toLowerCase())
  const hasCritical = issues.some((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH')

  // Grip-related issues → grips
  if (issueCategories.some((c) => c.includes('agarre') || c.includes('grip') || c.includes('mano'))) {
    categories.push('GRIPS')
    reason = 'Para mejorar tu agarre'
  }

  // Power/impact issues → rackets, strings
  if (issueCategories.some((c) => c.includes('potencia') || c.includes('impacto') || c.includes('fuerza'))) {
    categories.push('RACKETS', 'STRINGS')
    reason = 'Para maximizar tu potencia'
  }

  // Movement/footwork issues → shoes
  if (issueCategories.some((c) => c.includes('movimiento') || c.includes('pie') || c.includes('balance') || c.includes('postura') || c.includes('equilibrio'))) {
    categories.push('SHOES')
    reason = 'Para mejorar tu movilidad'
  }

  // Technique-based fallback
  if (categories.length === 0) {
    if (lower.includes('saque') || lower.includes('serve') || lower.includes('smash')) {
      categories.push('RACKETS', 'STRINGS')
      reason = 'Para potenciar tu saque'
    } else if (lower.includes('drive') || lower.includes('golpe') || lower.includes('reves') || lower.includes('volea')) {
      categories.push('RACKETS', 'GRIPS', 'STRINGS')
      reason = 'Para tu tecnica de golpe'
    } else if (lower.includes('movimiento') || lower.includes('desplazamiento')) {
      categories.push('SHOES', 'ACCESSORIES')
      reason = 'Para tu juego de pies'
    }
  }

  // Score-based strategy
  if (score !== null && score < 5 && hasCritical) {
    // Low score with critical issues → training aids and accessories
    if (!categories.includes('ACCESSORIES')) categories.push('ACCESSORIES')
    reason = 'Para ayudarte a mejorar'
  } else if (score !== null && score >= 8) {
    // High score → performance gear
    if (!categories.includes('RACKETS')) categories.push('RACKETS')
    reason = 'Equipamiento de rendimiento'
  }

  // Sport-specific defaults
  if (categories.length === 0) {
    if (sportLower.includes('padel')) {
      categories.push('RACKETS', 'GRIPS', 'SHOES')
      reason = 'Equipamiento de padel'
    } else if (sportLower.includes('pickleball')) {
      categories.push('RACKETS', 'ACCESSORIES')
      reason = 'Equipamiento de pickleball'
    } else {
      categories.push('RACKETS', 'STRINGS', 'ACCESSORIES')
      reason = `Equipamiento de ${sportName.toLowerCase()}`
    }
  }

  return { categories, reason }
}

interface ShopRecommendationsProps {
  sportName: string
  techniqueName: string
  issues?: Array<{ category: string; severity: string }>
  score?: number | null
}

export async function ShopRecommendations({ sportName, techniqueName, issues = [], score = null }: ShopRecommendationsProps) {
  const { categories, reason } = getRecommendationStrategy(sportName, techniqueName, issues, score)

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: { in: categories as never[] },
      stock: { gt: 0 },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 3,
    select: {
      slug: true,
      name: true,
      brand: true,
      priceCents: true,
      comparePriceCents: true,
      thumbnailUrl: true,
      category: true,
    },
  })

  if (products.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Equipamiento recomendado</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>
        </div>
        <GlassButton variant="ghost" size="sm" asChild>
          <Link href="/tienda">Ver tienda</Link>
        </GlassButton>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {products.map((product) => (
          <GlassCard key={product.slug} intensity="ultralight" padding="sm" hover="lift" asChild>
            <Link href={`/tienda/${product.slug}`}>
              {product.thumbnailUrl && (
                <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <p className="text-sm font-medium truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold">
                  S/ {(product.priceCents / 100).toFixed(2)}
                </span>
                {product.comparePriceCents && (
                  <span className="text-xs text-muted-foreground line-through">
                    S/ {(product.comparePriceCents / 100).toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

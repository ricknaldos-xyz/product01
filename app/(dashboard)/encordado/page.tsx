'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Clock, Zap, Truck, MapPin, Shield, Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'

interface CoverageData {
  districts: string[]
  proximamente: string[]
}

export default function EncordadoPage() {
  const [coverage, setCoverage] = useState<CoverageData | null>(null)
  const [loadingCoverage, setLoadingCoverage] = useState(true)

  useEffect(() => {
    async function fetchCoverage() {
      try {
        const res = await fetch('/api/stringing/coverage')
        if (res.ok) {
          const data = await res.json()
          setCoverage(data)
        }
      } catch {
        logger.error('Error fetching coverage')
      } finally {
        setLoadingCoverage(false)
      }
    }
    fetchCoverage()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">
          Servicio de Encordado Profesional
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Encordamos tu raqueta con precision profesional. Recogemos, encordamos y
          entregamos a domicilio o en taller.
        </p>
      </div>

      {/* Service Types */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tipos de Servicio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard intensity="medium" padding="lg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Estandar</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Entrega en 24-48 horas habiles
                </p>
                <p className="text-2xl font-bold mt-3">S/ 25.00</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard intensity="medium" padding="lg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Express</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Entrega el mismo dia
                </p>
                <p className="text-2xl font-bold mt-3">S/ 45.00</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Delivery Options */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Opciones de Entrega</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard intensity="light" padding="lg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Truck className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">A Domicilio</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Recogemos y entregamos en tu direccion
                </p>
                <p className="text-lg font-bold mt-2">S/ 15.00</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard intensity="light" padding="lg">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <MapPin className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">En Taller</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Llevas y recoges en el taller
                </p>
                <p className="text-lg font-bold mt-2">Gratis</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Coverage */}
      <GlassCard intensity="light" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Cobertura en Lima</h2>
        </div>

        {loadingCoverage ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : coverage ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Distritos con cobertura activa:</p>
              <div className="flex flex-wrap gap-2">
                {coverage.districts.map((district) => (
                  <GlassBadge key={district} variant="success">
                    {district}
                  </GlassBadge>
                ))}
              </div>
            </div>

            {coverage.proximamente.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Proximamente:</p>
                <div className="flex flex-wrap gap-2">
                  {coverage.proximamente.map((city) => (
                    <div key={city} className="flex items-center gap-1.5">
                      <GlassBadge variant="default">{city}</GlassBadge>
                      <GlassBadge variant="warning" size="sm">Pronto</GlassBadge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No se pudo cargar la informacion de cobertura.</p>
        )}
      </GlassCard>

      {/* CTA */}
      <div className="text-center">
        <Link href="/encordado/solicitar">
          <GlassButton variant="solid" size="xl">
            Solicitar Encordado
          </GlassButton>
        </Link>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface CoverageCheckerProps {
  district: string
  onDistrictChange: (district: string) => void
}

export function CoverageChecker({ district, onDistrictChange }: CoverageCheckerProps) {
  const [districts, setDistricts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await fetch('/api/stringing/coverage')
        if (res.ok) {
          const data = await res.json()
          setDistricts(data.districts || [])
        }
      } catch {
        console.error('Error fetching districts')
      } finally {
        setLoading(false)
      }
    }
    fetchDistricts()
  }, [])

  const isCovered = district ? districts.includes(district) : null

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Distrito *</label>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cargando distritos...</span>
        </div>
      ) : (
        <>
          <select
            className="glass-input w-full"
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
          >
            <option value="">Seleccionar distrito</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {district && (
            <div className="mt-2">
              {isCovered ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Cobertura disponible</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Sin cobertura</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

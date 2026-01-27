'use client'

import { useState, useEffect, useRef } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { Users, BarChart3, Swords, GraduationCap } from 'lucide-react'

interface StatsData {
  players: number
  analyses: number
  matches: number
  coaches: number
}

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (target <= 0 || startedRef.current) return
    startedRef.current = true

    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * target))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return count
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType
  value: number
  label: string
}) {
  const animatedValue = useCountUp(value)

  return (
    <GlassCard intensity="light" padding="md" hover="lift">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-2xl sm:text-3xl font-bold">
            {animatedValue.toLocaleString('es-PE')}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
      </div>
    </GlassCard>
  )
}

export function StatsCounter() {
  const [stats, setStats] = useState<StatsData>({
    players: 0,
    analyses: 0,
    matches: 0,
    coaches: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/public/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // Silently fail - will show zeros
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
      <StatCard icon={Users} value={stats.players} label="Jugadores" />
      <StatCard icon={BarChart3} value={stats.analyses} label="Analisis IA" />
      <StatCard icon={Swords} value={stats.matches} label="Partidos jugados" />
      <StatCard icon={GraduationCap} value={stats.coaches} label="Entrenadores" />
    </div>
  )
}

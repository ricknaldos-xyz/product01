'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/glass-card'
import { logger } from '@/lib/logger'

interface ActivityDay {
  date: string
  count: number
}

interface ActivityLog {
  id: string
  date: string
  analysisCount: number
  exerciseCount: number
}

function getIntensityClass(count: number): string {
  if (count === 0) return 'glass-ultralight border-glass'
  if (count === 1) return 'bg-success/30 border border-success/20'
  if (count === 2) return 'bg-success/50 border border-success/30'
  if (count <= 4) return 'bg-success/70 border border-success/40'
  return 'bg-success border border-success/50'
}

function getMonthLabels(): string[] {
  const months = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.push(date.toLocaleString('es', { month: 'short' }))
  }

  return months
}

export function ActivityHeatmap() {
  const [activities, setActivities] = useState<ActivityDay[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDays, setTotalDays] = useState(0)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch('/api/gamification/activity')
        if (response.ok) {
          const data: ActivityLog[] = await response.json()

          // Convert to ActivityDay format
          const activityMap = new Map<string, number>()
          data.forEach((log) => {
            const dateStr = new Date(log.date).toISOString().split('T')[0]
            const count = log.analysisCount + log.exerciseCount
            activityMap.set(dateStr, count)
          })

          // Generate last 365 days
          const days: ActivityDay[] = []
          const today = new Date()
          for (let i = 364; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            days.push({
              date: dateStr,
              count: activityMap.get(dateStr) || 0,
            })
          }

          setActivities(days)
          setTotalDays(data.length)
        }
      } catch (error) {
        logger.error('Failed to fetch activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return (
      <GlassCard intensity="light" padding="lg">
        <div className="h-32 glass-ultralight rounded-xl animate-pulse" />
      </GlassCard>
    )
  }

  // Group by weeks (columns)
  const weeks: ActivityDay[][] = []
  let currentWeek: ActivityDay[] = []

  // Start from the first Sunday
  const firstDay = new Date(activities[0]?.date || new Date())
  const startPadding = firstDay.getDay()

  // Add empty cells for padding at start
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push({ date: '', count: -1 })
  }

  activities.forEach((day) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const monthLabels = getMonthLabels()

  return (
    <GlassCard intensity="light" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Actividad</h2>
        <span className="text-sm text-muted-foreground">
          {totalDays} dias activos en el ultimo ano
        </span>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-2 ml-7">
          {monthLabels.map((month, i) => (
            <div
              key={i}
              className="text-xs text-muted-foreground"
              style={{ width: `${(52 / 12) * 14}px` }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] text-xs text-muted-foreground pr-2">
            <span className="h-[14px]"></span>
            <span className="h-[14px]">Lun</span>
            <span className="h-[14px]"></span>
            <span className="h-[14px]">Mie</span>
            <span className="h-[14px]"></span>
            <span className="h-[14px]">Vie</span>
            <span className="h-[14px]"></span>
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      'w-[14px] h-[14px] rounded-sm transition-all duration-[var(--duration-fast)]',
                      day.count === -1
                        ? 'bg-transparent'
                        : getIntensityClass(day.count),
                      day.count > 0 && 'hover:scale-125'
                    )}
                    title={
                      day.count >= 0
                        ? `${day.date}: ${day.count} actividades`
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Menos</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'w-[14px] h-[14px] rounded-sm',
                  getIntensityClass(level === 0 ? 0 : level + 1)
                )}
              />
            ))}
          </div>
          <span>Mas</span>
        </div>
      </div>
    </GlassCard>
  )
}

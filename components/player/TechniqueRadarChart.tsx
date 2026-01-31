'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { MIN_TECHNIQUES_FOR_RANKING } from '@/lib/skill-score'

interface TechniqueData {
  technique: { name: string; slug: string }
  bestScore: number
}

interface TechniqueRadarChartProps {
  data: TechniqueData[]
  className?: string
}

export function TechniqueRadarChart({ data, className }: TechniqueRadarChartProps) {
  if (data.length < MIN_TECHNIQUES_FOR_RANKING) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          {`Necesitas al menos ${MIN_TECHNIQUES_FOR_RANKING} tecnicas analizadas para ver el radar`}
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    subject: d.technique.name,
    score: d.bestScore,
    fullMark: 100,
  }))

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useMemo } from 'react'

interface ProgressionPoint {
  date: string
  fullDate: string
  score: number
  technique: string
}

interface ScoreProgressionChartProps {
  data: ProgressionPoint[]
  title?: string
}

const TECHNIQUE_COLORS = [
  '#256F50', // primary orange
  '#16a34a', // green
  '#d97706', // amber
  '#0891b2', // cyan
  '#dc2626', // red
  '#1A5038', // warm brown
  '#c026d3', // fuchsia
  '#ea580c', // deep orange
]

export function ScoreProgressionChart({ data, title }: ScoreProgressionChartProps) {
  // Transform data: group by date, one column per technique
  const { chartData, techniques } = useMemo(() => {
    const techniqueSet = new Set<string>()
    data.forEach((p) => techniqueSet.add(p.technique))
    const techniques = Array.from(techniqueSet)

    // Group by fullDate
    const grouped = new Map<string, Record<string, number | string>>()
    data.forEach((p) => {
      if (!grouped.has(p.fullDate)) {
        grouped.set(p.fullDate, { date: p.date, fullDate: p.fullDate })
      }
      const entry = grouped.get(p.fullDate)!
      entry[p.technique] = p.score
    })

    return {
      chartData: Array.from(grouped.values()),
      techniques,
    }
  }, [data])

  if (!data || data.length < 2) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        Se necesitan al menos 2 analisis para ver el progreso
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
            tickLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
            tickLine={{ stroke: 'var(--color-border)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '12px',
              color: 'var(--color-foreground)',
            }}
            labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
            formatter={(value) => [`${Number(value).toFixed(1)}/10`, '']}
          />
          {techniques.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 11 }}
            />
          )}
          {techniques.map((technique, i) => (
            <Line
              key={technique}
              type="monotone"
              dataKey={technique}
              name={technique}
              stroke={TECHNIQUE_COLORS[i % TECHNIQUE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

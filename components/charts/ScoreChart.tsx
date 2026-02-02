'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ScoreData {
  technique: string
  score: number
  date: string
}

interface ScoreChartProps {
  data: ScoreData[]
  title?: string
}

function getScoreColor(score: number) {
  if (score >= 8) return '#22c55e' // green
  if (score >= 6) return '#2563eb' // blue
  if (score >= 4) return '#eab308' // yellow
  return '#ef4444' // red
}

export function ScoreChart({ data, title }: ScoreChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No hay analisis completados
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="technique"
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
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
            formatter={(value) => [`${Number(value).toFixed(1)}/10`, 'Puntuacion']}
          />
          <Bar dataKey="score" name="Puntuacion" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

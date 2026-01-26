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
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="technique"
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickLine={{ stroke: '#e4e4e7' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickLine={{ stroke: '#e4e4e7' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#18181b', fontWeight: 600 }}
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

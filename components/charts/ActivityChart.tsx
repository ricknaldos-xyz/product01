'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ActivityData {
  date: string
  analyses: number
  exercises: number
}

interface ActivityChartProps {
  data: ActivityData[]
  title?: string
}

export function ActivityChart({ data, title }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No hay datos de actividad
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
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
          />
          <Line
            type="monotone"
            dataKey="analyses"
            name="Analisis"
            stroke="#256F50"
            strokeWidth={2}
            dot={{ fill: '#256F50', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="exercises"
            name="Ejercicios"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

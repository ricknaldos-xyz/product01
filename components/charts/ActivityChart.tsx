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
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickLine={{ stroke: '#e4e4e7' }}
          />
          <YAxis
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
          />
          <Line
            type="monotone"
            dataKey="analyses"
            name="Analisis"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2 }}
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

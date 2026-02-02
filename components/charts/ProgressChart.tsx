'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ProgressData {
  date: string
  completed: number
  total: number
}

interface ProgressChartProps {
  data: ProgressData[]
  title?: string
}

export function ProgressChart({ data, title }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No hay datos de progreso disponibles
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#256F50" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#256F50" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="completed"
            name="Ejercicios completados"
            stroke="#256F50"
            fillOpacity={1}
            fill="url(#colorCompleted)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

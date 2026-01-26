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
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="completed"
            name="Ejercicios completados"
            stroke="#2563eb"
            fillOpacity={1}
            fill="url(#colorCompleted)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

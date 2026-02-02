import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Card, CardHeader } from '@/components/common'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/services/utils'
import type { VolatilityData } from '@/services/utils/volatility'

interface VolatilityChartProps {
  data: VolatilityData[]
  period: string
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  const { t } = useTranslation()
  
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const date = new Date(data.date)

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {formatDate(date)}
      </p>
      <p className="font-bold text-gray-900 dark:text-gray-100">
        {t('volatility.volatility')}: {data.volatility.toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('volatility.price')}: ${data.price.toFixed(2)}
      </p>
    </div>
  )
}

export function VolatilityChart({ data, period }: VolatilityChartProps) {
  const { t } = useTranslation()

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title={t('volatility.chart')} />
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t('volatility.noData')}
        </div>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    volatility: Math.round(item.volatility * 100) / 100,
    price: Math.round(item.price * 100) / 100,
  }))

  return (
    <Card>
      <CardHeader 
        title={t('volatility.chart')}
        subtitle={t('volatility.period', { period })}
      />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="volatilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              className="dark:text-gray-400"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              className="dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="volatility"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#volatilityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

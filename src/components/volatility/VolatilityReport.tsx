import { AlertTriangle, Activity } from 'lucide-react'
import { Card, CardHeader, VolatilityChart } from './index'
import { useVolatility } from '@/hooks'
import { StatisticsCard } from '@/components/statistics'
import { useTranslation } from 'react-i18next'

export function VolatilityReport() {
  const { t } = useTranslation()
  const {
    volatilityData,
    averageVolatility,
    volatilityClassification,
    coefficientOfVariation,
    isLoading,
    period,
  } = useVolatility('month')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-400 dark:text-gray-500">
              {t('common.loading')}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const isHighVolatility = volatilityClassification?.level === 'high'

  return (
    <div className="space-y-4">
      {/* Volatility Summary */}
      <div className="grid grid-cols-2 gap-3">
        <StatisticsCard
          title={t('volatility.average')}
          value={averageVolatility.toFixed(2)}
          subtitle={t('volatility.overPeriod')}
          icon={<Activity size={18} className="text-purple-500 dark:text-purple-400" />}
        />
        <StatisticsCard
          title={t('volatility.coefficient')}
          value={`${coefficientOfVariation.toFixed(2)}%`}
          subtitle={t('volatility.cvDescription')}
          icon={<Activity size={18} className="text-blue-500 dark:text-blue-400" />}
        />
      </div>

      {/* Volatility Classification */}
      <Card>
        <CardHeader
          title={t('volatility.classification')}
          action={
            isHighVolatility ? (
              <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />
            ) : (
              <Activity size={18} className="text-green-500 dark:text-green-400" />
            )
          }
        />
        <div className={`rounded-xl p-4 ${
          volatilityClassification?.level === 'high'
            ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
            : volatilityClassification?.level === 'medium'
            ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
            : 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold text-lg ${
                volatilityClassification?.level === 'high'
                  ? 'text-amber-700 dark:text-amber-300'
                  : volatilityClassification?.level === 'medium'
                  ? 'text-yellow-700 dark:text-yellow-300'
                  : 'text-green-700 dark:text-green-300'
              }`}>
                {volatilityClassification?.level === 'high'
                  ? t('volatility.high')
                  : volatilityClassification?.level === 'medium'
                  ? t('volatility.medium')
                  : t('volatility.low')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {volatilityClassification?.percentage.toFixed(2)}% {t('volatility.ofAveragePrice')}
              </p>
            </div>
            {isHighVolatility && (
              <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400" />
            )}
          </div>
          {isHighVolatility && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
              {t('volatility.highWarning')}
            </p>
          )}
        </div>
      </Card>

      {/* Volatility Chart */}
      <VolatilityChart data={volatilityData} period={period} />
    </div>
  )
}

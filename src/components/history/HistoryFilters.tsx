import { Calendar, Filter } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { useTranslation } from 'react-i18next'
import type { GoldType } from '@/types'

interface HistoryFiltersProps {
  startDate: Date
  endDate: Date
  type: 'world' | 'vn'
  goldType?: GoldType
  brand?: string
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  onTypeChange: (type: 'world' | 'vn') => void
  onGoldTypeChange?: (type: GoldType) => void
  onBrandChange?: (brand: string) => void
}

export function HistoryFilters({
  startDate,
  endDate,
  type,
  goldType,
  brand,
  onStartDateChange,
  onEndDateChange,
  onTypeChange,
  onGoldTypeChange,
  onBrandChange,
}: HistoryFiltersProps) {
  const { t } = useTranslation()

  const goldTypes: { value: GoldType; label: string }[] = [
    { value: 'SJC', label: t('price.sjc') },
    { value: 'NHAN_9999', label: t('price.nhan9999') },
  ]

  const brands = ['SJC', 'DOJI', 'PNJ']

  return (
    <Card>
      <CardHeader
        title={t('history.filters')}
        action={<Filter size={18} className="text-gold-500 dark:text-gold-400" />}
      />
      <div className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('history.selectType')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onTypeChange('world')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                type === 'world'
                  ? 'bg-gold-500 dark:bg-gold-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t('price.worldGold')}
            </button>
            <button
              onClick={() => onTypeChange('vn')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                type === 'vn'
                  ? 'bg-gold-500 dark:bg-gold-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t('price.vnGold')}
            </button>
          </div>
        </div>

        {/* VN Gold specific filters */}
        {type === 'vn' && (
          <>
            {onGoldTypeChange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('history.selectGoldType')}
                </label>
                <select
                  value={goldType || 'SJC'}
                  onChange={(e) => onGoldTypeChange(e.target.value as GoldType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {goldTypes.map((gt) => (
                    <option key={gt.value} value={gt.value}>
                      {gt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onBrandChange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('history.selectBrand')}
                </label>
                <select
                  value={brand || 'SJC'}
                  onChange={(e) => onBrandChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Date range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('history.startDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => onStartDateChange(new Date(e.target.value))}
                max={endDate.toISOString().split('T')[0]}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('history.endDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={(e) => onEndDateChange(new Date(e.target.value))}
                min={startDate.toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

import { useState } from 'react'
import { HistoryFilters, HistoryTable } from '@/components/history'
import { usePriceHistory } from '@/hooks'
import type { GoldType } from '@/types'

export default function History() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date
  })
  const [endDate, setEndDate] = useState(new Date())
  const [type, setType] = useState<'world' | 'vn'>('world')
  const [goldType, setGoldType] = useState<GoldType>('SJC')
  const [brand, setBrand] = useState('SJC')

  const { data, isLoading, isError } = usePriceHistory({
    startDate,
    endDate,
    type,
    goldType: type === 'vn' ? goldType : undefined,
    brand: type === 'vn' ? brand : undefined,
  })

  return (
    <div className="space-y-4">
      <HistoryFilters
        startDate={startDate}
        endDate={endDate}
        type={type}
        goldType={goldType}
        brand={brand}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onTypeChange={setType}
        onGoldTypeChange={setGoldType}
        onBrandChange={setBrand}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-400 dark:text-gray-500">
              Đang tải dữ liệu...
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="space-y-4">
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            Có lỗi xảy ra khi tải dữ liệu
          </div>
        </div>
      ) : (
        <HistoryTable
          worldData={type === 'world' ? (data as any) : undefined}
          vnData={type === 'vn' ? (data as any) : undefined}
          type={type}
        />
      )}
    </div>
  )
}

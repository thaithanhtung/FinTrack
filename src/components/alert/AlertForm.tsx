import { useState } from 'react'
import { Bell, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader, Button } from '@/components/common'
import { useAlerts } from '@/hooks'
import { formatVND, formatUSD } from '@/services/utils'
import type { GoldType, AlertCondition } from '@/types'

const goldTypes: { value: GoldType | 'XAU'; label: string }[] = [
  { value: 'XAU', label: 'Vàng thế giới (XAU/USD)' },
  { value: 'SJC', label: 'Vàng SJC' },
  { value: 'NHAN_9999', label: 'Nhẫn 9999' },
]

export function AlertForm() {
  const { addAlert } = useAlerts()
  const [goldType, setGoldType] = useState<GoldType | 'XAU'>('XAU')
  const [condition, setCondition] = useState<AlertCondition>('ABOVE')
  const [targetPrice, setTargetPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isWorldGold = goldType === 'XAU'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetPrice) return

    setIsSubmitting(true)
    
    const price = parseFloat(targetPrice.replace(/,/g, ''))
    addAlert(goldType, condition, price)
    
    setTargetPrice('')
    setIsSubmitting(false)
  }

  const formatInputPrice = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    return numericValue
  }

  return (
    <Card>
      <CardHeader 
        title="Đặt cảnh báo giá"
        subtitle="Nhận thông báo khi giá đạt mức mong muốn"
        action={<Bell size={18} className="text-gold-500" />}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Gold type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại vàng
          </label>
          <select
            value={goldType}
            onChange={(e) => setGoldType(e.target.value as GoldType | 'XAU')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 bg-white"
          >
            {goldTypes.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Condition selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Điều kiện
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCondition('ABOVE')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                condition === 'ABOVE'
                  ? 'border-up bg-up/10 text-up'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <TrendingUp size={18} />
              <span className="font-medium">Vượt mức</span>
            </button>
            <button
              type="button"
              onClick={() => setCondition('BELOW')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                condition === 'BELOW'
                  ? 'border-down bg-down/10 text-down'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <TrendingDown size={18} />
              <span className="font-medium">Dưới mức</span>
            </button>
          </div>
        </div>

        {/* Target price input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá mục tiêu ({isWorldGold ? 'USD' : 'VNĐ'})
          </label>
          <div className="relative">
            <input
              type="text"
              value={targetPrice}
              onChange={(e) => setTargetPrice(formatInputPrice(e.target.value))}
              placeholder={isWorldGold ? '2700' : '85000000'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-lg font-medium"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {isWorldGold ? 'USD/oz' : 'VNĐ/lượng'}
            </span>
          </div>
          {targetPrice && (
            <p className="text-sm text-gray-500 mt-1">
              {isWorldGold 
                ? formatUSD(parseFloat(targetPrice) || 0)
                : formatVND(parseFloat(targetPrice) || 0) + ' đ'
              }
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={!targetPrice}
          isLoading={isSubmitting}
        >
          <Bell size={18} />
          Tạo cảnh báo
        </Button>
      </form>
    </Card>
  )
}

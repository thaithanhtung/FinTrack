import { Card, CardHeader } from '@/components/common'
import { useSJCPrice } from '@/hooks'
import { calculateSpread, formatVND } from '@/services/utils'
import { AlertTriangle } from 'lucide-react'

export function SpreadCalculator() {
  const { data: sjcPrice } = useSJCPrice()

  if (!sjcPrice) return null

  const spread = calculateSpread(sjcPrice.buyPrice, sjcPrice.sellPrice)

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
      <CardHeader 
        title="Chênh lệch Mua - Bán"
        subtitle="Vàng SJC"
        action={<AlertTriangle size={18} className="text-rose-500" />}
      />

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Giá mua vào</p>
            <p className="text-lg font-bold text-gray-700">
              {formatVND(spread.buyPrice / 1000000)} tr
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Giá bán ra</p>
            <p className="text-lg font-bold text-gold-600">
              {formatVND(spread.sellPrice / 1000000)} tr
            </p>
          </div>
        </div>

        <div className="bg-rose-100 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Spread</span>
            <span className="font-semibold text-rose-700">
              {formatVND(spread.spread)} đ ({spread.spreadPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Lỗ nếu bán ngay</span>
            <span className="font-bold text-rose-700">
              -{formatVND(spread.lossIfSellNow)} đ/lượng
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          * Nếu mua vàng với giá bán ra và bán lại ngay với giá mua vào
        </p>
      </div>
    </Card>
  )
}

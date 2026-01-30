import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardHeader, Loading, ErrorMessage } from '@/components/common'
import { useWorldGoldPrice, useExchangeRate, useSJCPrice } from '@/hooks'
import { comparePrices, formatVND, formatUSD } from '@/services/utils'

export function PriceComparison() {
  const { data: worldPrice, isLoading: worldLoading } = useWorldGoldPrice()
  const { data: exchangeRate, isLoading: rateLoading } = useExchangeRate()
  const { data: sjcPrice, isLoading: sjcLoading } = useSJCPrice()

  const isLoading = worldLoading || rateLoading || sjcLoading

  if (isLoading) {
    return (
      <Card>
        <Loading size="sm" text="Đang tính toán..." />
      </Card>
    )
  }

  if (!worldPrice || !exchangeRate || !sjcPrice) {
    return (
      <Card>
        <ErrorMessage message="Không đủ dữ liệu để so sánh" />
      </Card>
    )
  }

  const comparison = comparePrices(
    worldPrice.price,
    sjcPrice.sellPrice,
    exchangeRate.usdToVnd
  )

  const isHigher = comparison.difference > 0
  const DiffIcon = isHigher ? TrendingUp : TrendingDown

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader 
        title="So sánh giá"
        subtitle="Vàng thế giới vs Việt Nam"
        action={<ArrowRightLeft size={18} className="text-blue-500" />}
      />

      <div className="space-y-4">
        {/* World price converted */}
        <div className="bg-white/60 rounded-xl p-3">
          <p className="text-sm text-gray-600 mb-1">
            Giá thế giới quy đổi
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatVND(comparison.worldPriceVND)}
            </span>
            <span className="text-sm text-gray-500">VNĐ/lượng</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {formatUSD(worldPrice.price)} × {formatVND(exchangeRate.usdToVnd)} VNĐ/USD
          </p>
        </div>

        {/* VN price */}
        <div className="bg-white/60 rounded-xl p-3">
          <p className="text-sm text-gray-600 mb-1">
            Giá SJC Việt Nam (bán ra)
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gold-600">
              {formatVND(comparison.vnPrice)}
            </span>
            <span className="text-sm text-gray-500">VNĐ/lượng</span>
          </div>
        </div>

        {/* Difference */}
        <div className={`rounded-xl p-3 ${isHigher ? 'bg-amber-100' : 'bg-green-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Chênh lệch</p>
              <div className="flex items-center gap-2">
                <DiffIcon 
                  size={20} 
                  className={isHigher ? 'text-amber-600' : 'text-green-600'} 
                />
                <span className={`text-xl font-bold ${isHigher ? 'text-amber-700' : 'text-green-700'}`}>
                  {isHigher ? '+' : ''}{formatVND(comparison.difference)}
                </span>
              </div>
            </div>
            <div className={`text-right px-3 py-1 rounded-full ${isHigher ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
              <span className="font-semibold">
                {isHigher ? '+' : ''}{comparison.differencePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {isHigher 
              ? 'Giá vàng VN cao hơn giá thế giới quy đổi'
              : 'Giá vàng VN thấp hơn giá thế giới quy đổi'
            }
          </p>
        </div>
      </div>
    </Card>
  )
}

import { Globe } from 'lucide-react'
import { Card, CardHeader, PriceChange, LastUpdated, Loading, ErrorMessage } from '@/components/common'
import { useWorldGoldPrice } from '@/hooks'
import { formatUSD } from '@/services/utils'

export function WorldGoldCard() {
  const { data, isLoading, isError, refetch } = useWorldGoldPrice()

  if (isLoading) {
    return (
      <Card>
        <Loading size="sm" text="Đang tải giá vàng thế giới..." />
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card>
        <ErrorMessage message="Không thể tải giá vàng thế giới" onRetry={refetch} />
      </Card>
    )
  }

  const isUp = data.change >= 0

  return (
    <Card className="bg-gradient-to-br from-gold-50 to-amber-50 border-gold-200">
      <CardHeader 
        title="Vàng Thế Giới" 
        subtitle="XAU/USD"
        action={
          <div className="flex items-center gap-1 text-gold-600">
            <Globe size={16} />
          </div>
        }
      />
      
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 price-value">
              {formatUSD(data.price)}
            </p>
            <p className="text-sm text-gray-500">USD/oz</p>
          </div>
          <PriceChange 
            change={data.change} 
            changePercent={data.changePercent}
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gold-200/50">
          <div>
            <p className="text-xs text-gray-500">Cao nhất 24h</p>
            <p className={`font-semibold ${isUp ? 'text-up' : 'text-gray-700'}`}>
              {formatUSD(data.high24h)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Thấp nhất 24h</p>
            <p className={`font-semibold ${!isUp ? 'text-down' : 'text-gray-700'}`}>
              {formatUSD(data.low24h)}
            </p>
          </div>
        </div>

        <LastUpdated timestamp={data.timestamp} />
      </div>
    </Card>
  )
}

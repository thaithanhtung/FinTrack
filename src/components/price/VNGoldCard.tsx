import { MapPin } from 'lucide-react'
import { Card, CardHeader, LastUpdated, Loading, ErrorMessage } from '@/components/common'
import { useVNGoldPrices } from '@/hooks'
import { formatVND, getGoldTypeName, getBrandName } from '@/services/utils'
import type { VNGoldPrice } from '@/types'

interface PriceRowProps {
  item: VNGoldPrice
}

function PriceRow({ item }: PriceRowProps) {
  const spread = item.sellPrice - item.buyPrice
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{getBrandName(item.brand)}</span>
          {item.region && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <MapPin size={10} />
              {item.region}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Chênh lệch: {formatVND(spread)} đ
        </p>
      </div>
      <div className="text-right">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-500">Mua vào</p>
            <p className="font-semibold text-gray-700 price-value">
              {formatVND(item.buyPrice / 1000)}K
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Bán ra</p>
            <p className="font-semibold text-gold-600 price-value">
              {formatVND(item.sellPrice / 1000)}K
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VNGoldCard() {
  const { data, isLoading, isError, refetch } = useVNGoldPrices()

  if (isLoading) {
    return (
      <Card>
        <Loading size="sm" text="Đang tải giá vàng Việt Nam..." />
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card>
        <ErrorMessage message="Không thể tải giá vàng Việt Nam" onRetry={refetch} />
      </Card>
    )
  }

  // Group by gold type
  const sjcPrices = data.filter(p => p.type === 'SJC')
  const nhanPrices = data.filter(p => p.type === 'NHAN_9999')

  return (
    <div className="space-y-4">
      {/* SJC */}
      <Card>
        <CardHeader 
          title={getGoldTypeName('SJC')}
          subtitle="Vàng miếng SJC"
        />
        <div className="divide-y divide-gray-100">
          {sjcPrices.map((item, index) => (
            <PriceRow key={`sjc-${index}`} item={item} />
          ))}
        </div>
        {sjcPrices[0] && <LastUpdated timestamp={sjcPrices[0].timestamp} />}
      </Card>

      {/* Nhẫn 9999 */}
      <Card>
        <CardHeader 
          title={getGoldTypeName('NHAN_9999')}
          subtitle="Vàng nhẫn 4 số 9"
        />
        <div className="divide-y divide-gray-100">
          {nhanPrices.map((item, index) => (
            <PriceRow key={`nhan-${index}`} item={item} />
          ))}
        </div>
        {nhanPrices[0] && <LastUpdated timestamp={nhanPrices[0].timestamp} />}
      </Card>
    </div>
  )
}

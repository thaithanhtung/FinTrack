import { useState } from 'react'
import { Calculator, ChevronDown } from 'lucide-react'
import { Card, CardHeader, Loading, ErrorMessage } from '@/components/common'
import { useVNGoldPrices, useExchangeRate } from '@/hooks'
import { formatVND, formatUSD } from '@/services/utils'

// Đơn vị vàng Việt Nam
type GoldUnit = 'phan' | 'chi' | 'cay'

const goldUnits: { value: GoldUnit; label: string; ratio: number }[] = [
  { value: 'phan', label: 'Phân', ratio: 0.1 },   // 1 phân = 0.1 chỉ = 0.01 lượng
  { value: 'chi', label: 'Chỉ', ratio: 1 },       // 1 chỉ = 0.1 lượng
  { value: 'cay', label: 'Cây (Lượng)', ratio: 10 }, // 1 cây = 1 lượng = 10 chỉ
]

// Loại vàng để quy đổi
const goldTypes = [
  { value: 'SJC', label: 'Vàng SJC' },
  { value: 'NHAN_9999', label: 'Nhẫn 9999' },
]

export default function Converter() {
  const { data: vnPrices, isLoading: isLoadingVN, isError: isErrorVN, refetch: refetchVN } = useVNGoldPrices()
  const { data: exchangeRate, isLoading: isLoadingRate } = useExchangeRate()
  
  const [amount, setAmount] = useState('1')
  const [selectedUnit, setSelectedUnit] = useState<GoldUnit>('chi')
  const [selectedGoldType, setSelectedGoldType] = useState('SJC')
  const [showUnitDropdown, setShowUnitDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  // Lấy giá bán hiện tại của loại vàng được chọn
  const getCurrentSellPrice = (): number | null => {
    if (!vnPrices || vnPrices.length === 0) return null
    
    const goldPrice = vnPrices.find(p => p.type === selectedGoldType)
    return goldPrice?.sellPrice || null
  }

  const sellPrice = getCurrentSellPrice()
  const selectedUnitInfo = goldUnits.find(u => u.value === selectedUnit)!

  // Tính giá trị quy đổi
  const calculateValue = (): { vnd: number; usd: number } | null => {
    if (!sellPrice || !amount) return null
    
    const qty = parseFloat(amount)
    if (isNaN(qty) || qty <= 0) return null

    // Giá bán là giá 1 lượng (10 chỉ)
    // 1 chỉ = sellPrice / 10
    const pricePerChi = sellPrice / 10
    
    // Tính theo đơn vị được chọn
    const totalVND = pricePerChi * selectedUnitInfo.ratio * qty

    // Quy đổi sang USD
    const totalUSD = exchangeRate ? totalVND / exchangeRate.usdToVnd : 0

    return {
      vnd: Math.round(totalVND),
      usd: Math.round(totalUSD * 100) / 100,
    }
  }

  const result = calculateValue()

  // Loading state
  if (isLoadingVN || isLoadingRate) {
    return (
      <div className="space-y-4">
        <Card>
          <Loading size="md" text="Đang tải giá vàng..." />
        </Card>
      </div>
    )
  }

  // Error state
  if (isErrorVN) {
    return (
      <div className="space-y-4">
        <Card>
          <ErrorMessage message="Không thể tải giá vàng" onRetry={refetchVN} />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Giá hiện tại */}
      {sellPrice && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Giá bán {selectedGoldType === 'SJC' ? 'SJC' : 'Nhẫn 9999'} hiện tại</p>
              <p className="text-xl font-bold text-amber-700">
                {formatVND(sellPrice)} đ/lượng
              </p>
              <p className="text-sm text-gray-500 mt-1">
                = {formatVND(sellPrice / 10)} đ/chỉ
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>1 lượng = 10 chỉ</p>
              <p>1 chỉ = 10 phân</p>
            </div>
          </div>
        </Card>
      )}

      {/* Converter */}
      <Card>
        <CardHeader 
          title="Quy đổi giá vàng"
          subtitle="Tính giá trị vàng theo đơn vị Việt Nam"
          action={<Calculator size={18} className="text-gold-500" />}
        />

        <div className="space-y-4">
          {/* Chọn loại vàng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại vàng
            </label>
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-left flex items-center justify-between"
              >
                <span className="font-medium">
                  {goldTypes.find(t => t.value === selectedGoldType)?.label}
                </span>
                <ChevronDown size={20} className="text-gray-400" />
              </button>
              {showTypeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                  {goldTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedGoldType(type.value)
                        setShowTypeDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${
                        selectedGoldType === type.value ? 'bg-amber-50 text-amber-700' : ''
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input số lượng và đơn vị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng
            </label>
            <div className="flex gap-2">
              {/* Input số */}
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="1"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-lg font-medium"
              />
              
              {/* Dropdown đơn vị */}
              <div className="relative">
                <button
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white flex items-center gap-2 min-w-[140px] justify-between"
                >
                  <span className="font-medium">{selectedUnitInfo.label}</span>
                  <ChevronDown size={20} className="text-gray-400" />
                </button>
                {showUnitDropdown && (
                  <div className="absolute z-10 right-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                    {goldUnits.map(unit => (
                      <button
                        key={unit.value}
                        onClick={() => {
                          setSelectedUnit(unit.value)
                          setShowUnitDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${
                          selectedUnit === unit.value ? 'bg-amber-50 text-amber-700' : ''
                        }`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nút tính nhanh */}
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 5, 10].map(num => (
              <button
                key={num}
                onClick={() => setAmount(num.toString())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  amount === num.toString()
                    ? 'bg-gold-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {num} {selectedUnitInfo.label}
              </button>
            ))}
          </div>

          {/* Kết quả */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-2">
              Giá trị {amount || '0'} {selectedUnitInfo.label.toLowerCase()} {selectedGoldType === 'SJC' ? 'SJC' : 'Nhẫn 9999'}
            </p>
            
            {result ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-700">
                    {formatVND(result.vnd)}
                  </span>
                  <span className="text-lg text-green-600">VNĐ</span>
                </div>
                
                {exchangeRate && (
                  <div className="flex items-baseline gap-2 text-gray-600">
                    <span className="text-lg font-semibold">
                      ≈ {formatUSD(result.usd)}
                    </span>
                    <span className="text-sm">USD</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-400">---</p>
            )}
          </div>
        </div>
      </Card>

      {/* Bảng quy đổi nhanh */}
      <Card>
        <CardHeader title="Bảng quy đổi nhanh" subtitle={`Giá ${selectedGoldType === 'SJC' ? 'SJC' : 'Nhẫn 9999'} hiện tại`} />
        
        {sellPrice ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Số lượng</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Giá trị (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2">1 phân</td>
                  <td className="py-2 text-right font-medium">{formatVND(sellPrice / 100)} đ</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">1 chỉ</td>
                  <td className="py-2 text-right font-medium">{formatVND(sellPrice / 10)} đ</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">5 chỉ</td>
                  <td className="py-2 text-right font-medium">{formatVND(sellPrice / 2)} đ</td>
                </tr>
                <tr className="border-b border-gray-100 bg-amber-50">
                  <td className="py-2 font-medium">1 cây (lượng)</td>
                  <td className="py-2 text-right font-bold text-amber-700">{formatVND(sellPrice)} đ</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">2 cây</td>
                  <td className="py-2 text-right font-medium">{formatVND(sellPrice * 2)} đ</td>
                </tr>
                <tr>
                  <td className="py-2">5 cây</td>
                  <td className="py-2 text-right font-medium">{formatVND(sellPrice * 5)} đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Không có dữ liệu giá</p>
        )}
      </Card>

      {/* Giải thích đơn vị */}
      <Card>
        <CardHeader title="Đơn vị đo vàng Việt Nam" />
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>1 cây (lượng)</span>
            <span className="font-medium">= 10 chỉ = 37.5 gram</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>1 chỉ</span>
            <span className="font-medium">= 10 phân = 3.75 gram</span>
          </div>
          <div className="flex justify-between py-2">
            <span>1 phân</span>
            <span className="font-medium">= 0.375 gram</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

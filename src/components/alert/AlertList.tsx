import { Bell, BellOff, Trash2, TrendingUp, TrendingDown, Check } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { useAlerts } from '@/hooks'
import { formatVND, formatUSD, getGoldTypeName, formatTimeAgo } from '@/services/utils'
import type { PriceAlert } from '@/types'

interface AlertItemProps {
  alert: PriceAlert
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

function AlertItem({ alert, onToggle, onRemove }: AlertItemProps) {
  const isWorldGold = alert.goldType === 'XAU'
  const ConditionIcon = alert.condition === 'ABOVE' ? TrendingUp : TrendingDown
  const conditionColor = alert.condition === 'ABOVE' ? 'text-up' : 'text-down'
  const conditionBg = alert.condition === 'ABOVE' ? 'bg-up/10' : 'bg-down/10'

  return (
    <div className={`p-3 rounded-xl border ${alert.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {getGoldTypeName(alert.goldType)}
            </span>
            {alert.triggeredAt && (
              <span className="flex items-center gap-1 text-xs text-up bg-up/10 px-2 py-0.5 rounded-full">
                <Check size={12} />
                Đã kích hoạt
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm ${conditionColor} ${conditionBg} px-2 py-0.5 rounded-full`}>
              <ConditionIcon size={14} />
              {alert.condition === 'ABOVE' ? 'Vượt' : 'Dưới'}
            </span>
            <span className="font-semibold text-gray-800">
              {isWorldGold 
                ? formatUSD(alert.targetPrice)
                : formatVND(alert.targetPrice) + ' đ'
              }
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Tạo {formatTimeAgo(alert.createdAt)}
            {alert.triggeredAt && ` • Kích hoạt ${formatTimeAgo(alert.triggeredAt)}`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(alert.id)}
            className={`p-2 rounded-lg transition-colors ${
              alert.isActive 
                ? 'text-gold-600 hover:bg-gold-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={alert.isActive ? 'Tắt cảnh báo' : 'Bật cảnh báo'}
          >
            {alert.isActive ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <button
            onClick={() => onRemove(alert.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Xóa cảnh báo"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AlertList() {
  const { alerts, toggleAlert, removeAlert } = useAlerts()

  const activeAlerts = alerts.filter(a => a.isActive)
  const inactiveAlerts = alerts.filter(a => !a.isActive)

  if (alerts.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Chưa có cảnh báo nào</p>
          <p className="text-sm text-gray-400 mt-1">
            Tạo cảnh báo để nhận thông báo khi giá đạt mức mong muốn
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader 
            title="Cảnh báo đang hoạt động"
            subtitle={`${activeAlerts.length} cảnh báo`}
          />
          <div className="space-y-2">
            {activeAlerts.map(alert => (
              <AlertItem 
                key={alert.id} 
                alert={alert}
                onToggle={toggleAlert}
                onRemove={removeAlert}
              />
            ))}
          </div>
        </Card>
      )}

      {inactiveAlerts.length > 0 && (
        <Card>
          <CardHeader 
            title="Cảnh báo đã tắt / kích hoạt"
            subtitle={`${inactiveAlerts.length} cảnh báo`}
          />
          <div className="space-y-2">
            {inactiveAlerts.map(alert => (
              <AlertItem 
                key={alert.id} 
                alert={alert}
                onToggle={toggleAlert}
                onRemove={removeAlert}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

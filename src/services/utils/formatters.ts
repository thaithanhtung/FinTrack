import { formatDistanceToNow, format } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Format số tiền VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

/**
 * Format số tiền VND với đơn vị
 */
export function formatVNDWithUnit(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(2)} tỷ`
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)} triệu`
  }
  return formatVND(amount)
}

/**
 * Format giá USD
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format phần trăm thay đổi
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Format thay đổi giá
 */
export function formatPriceChange(value: number, isVND: boolean = false): string {
  const sign = value >= 0 ? '+' : ''
  if (isVND) {
    return `${sign}${formatVND(value)}`
  }
  return `${sign}${value.toFixed(2)}`
}

/**
 * Format thời gian "cách đây X phút"
 */
export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: vi })
}

/**
 * Format ngày giờ đầy đủ
 */
export function formatDateTime(date: Date): string {
  return format(date, 'HH:mm:ss dd/MM/yyyy', { locale: vi })
}

/**
 * Format ngày
 */
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

/**
 * Format giờ
 */
export function formatTime(date: Date): string {
  return format(date, 'HH:mm:ss', { locale: vi })
}

/**
 * Lấy tên loại vàng tiếng Việt
 */
export function getGoldTypeName(type: string): string {
  const names: Record<string, string> = {
    'SJC': 'Vàng SJC',
    'NHAN_9999': 'Nhẫn 9999',
    'NHAN_999': 'Nhẫn 999',
    'VANG_24K': 'Vàng 24K',
    'XAU': 'Vàng thế giới',
  }
  return names[type] || type
}

/**
 * Lấy tên thương hiệu
 */
export function getBrandName(brand: string): string {
  const names: Record<string, string> = {
    'SJC': 'SJC',
    'DOJI': 'DOJI',
    'PNJ': 'PNJ',
    'BTMC': 'Bảo Tín Minh Châu',
    'OTHER': 'Khác',
  }
  return names[brand] || brand
}

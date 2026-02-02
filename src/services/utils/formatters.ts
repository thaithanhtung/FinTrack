import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Convert timestamp sang giờ Việt Nam (UTC+7)
 * @param date - Date object hoặc timestamp (ms)
 * @returns Date object đã convert sang timezone Việt Nam
 */
export function toVietnamTime(date: Date | number): Date {
  const d = typeof date === "number" ? new Date(date) : date;

  // Validate date
  if (isNaN(d.getTime())) {
    console.error("Invalid date passed to toVietnamTime:", date);
    return new Date(); // Return current date as fallback
  }

  // Convert sang UTC+7 (Vietnam timezone)
  // Lấy UTC time, cộng thêm 7 giờ (7 * 60 * 60 * 1000 ms)
  const vnOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
  const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
  const vnTime = utcTime + vnOffset;

  return new Date(vnTime);
}

/**
 * Format số tiền VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

/**
 * Format số tiền VND với đơn vị
 */
export function formatVNDWithUnit(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(2)} tỷ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)} triệu`;
  }
  return formatVND(amount);
}

/**
 * Format giá USD
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format số với dấu phẩy (không ký hiệu tiền tệ)
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format phần trăm thay đổi
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Format thay đổi giá
 */
export function formatPriceChange(
  value: number,
  isVND: boolean = false
): string {
  const sign = value >= 0 ? "+" : "";
  if (isVND) {
    return `${sign}${formatVND(value)}`;
  }
  return `${sign}${value.toFixed(2)}`;
}

/**
 * Format thời gian "cách đây X phút" (timezone-aware)
 */
export function formatTimeAgo(date: Date): string {
  const vnDate = toVietnamTime(date);
  return formatDistanceToNow(vnDate, { addSuffix: true, locale: vi });
}

/**
 * Format ngày giờ đầy đủ (giờ Việt Nam)
 */
export function formatDateTime(date: Date): string {
  const vnDate = toVietnamTime(date);
  return format(vnDate, "HH:mm:ss dd/MM/yyyy", { locale: vi });
}

/**
 * Format ngày (giờ Việt Nam)
 */
export function formatDate(date: Date): string {
  // Validate date
  if (!date || isNaN(date.getTime())) {
    console.error("Invalid date passed to formatDate:", date);
    return "Invalid Date";
  }

  const vnDate = toVietnamTime(date);
  return format(vnDate, "dd/MM/yyyy", { locale: vi });
}

/**
 * Format giờ (giờ Việt Nam)
 */
export function formatTime(date: Date): string {
  const vnDate = toVietnamTime(date);
  return format(vnDate, "HH:mm:ss", { locale: vi });
}

/**
 * Lấy tên loại vàng tiếng Việt
 */
export function getGoldTypeName(type: string): string {
  const names: Record<string, string> = {
    SJC: "Vàng SJC",
    NHAN_9999: "Nhẫn 9999",
    NHAN_999: "Nhẫn 999",
    VANG_24K: "Vàng 24K",
    XAU: "Vàng thế giới",
  };
  return names[type] || type;
}

/**
 * Lấy tên thương hiệu
 */
export function getBrandName(brand: string): string {
  const names: Record<string, string> = {
    SJC: "SJC",
    DOJI: "DOJI",
    PNJ: "PNJ",
    BTMC: "Bảo Tín Minh Châu",
    OTHER: "Khác",
  };
  return names[brand] || brand;
}

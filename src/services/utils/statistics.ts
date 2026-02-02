import type { PriceHistoryPoint } from "@/types";

export interface PriceStatistics {
  average: number;
  high: number;
  low: number;
  volatility: number;
  totalRecords: number;
  upDays: number;
  downDays: number;
  neutralDays: number;
  upPercent: number;
  downPercent: number;
}

export interface PriceDirection {
  upDays: number;
  downDays: number;
  neutralDays: number;
}

/**
 * Tính toán thống kê giá từ lịch sử giá
 */
export function calculateStatistics(
  prices: PriceHistoryPoint[]
): PriceStatistics {
  if (prices.length === 0) {
    return {
      average: 0,
      high: 0,
      low: 0,
      volatility: 0,
      totalRecords: 0,
      upDays: 0,
      downDays: 0,
      neutralDays: 0,
      upPercent: 0,
      downPercent: 0,
    };
  }

  const priceValues = prices.map((p) => p.price);
  const average =
    priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
  const high = Math.max(...priceValues);
  const low = Math.min(...priceValues);

  // Tính độ biến động (standard deviation)
  const variance =
    priceValues.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) /
    priceValues.length;
  const volatility = Math.sqrt(variance);

  // Đếm số ngày tăng/giảm
  const direction = countPriceDirection(prices);
  const totalDays =
    direction.upDays + direction.downDays + direction.neutralDays;
  const upPercent = totalDays > 0 ? (direction.upDays / totalDays) * 100 : 0;
  const downPercent =
    totalDays > 0 ? (direction.downDays / totalDays) * 100 : 0;

  return {
    average: Math.round(average * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    totalRecords: prices.length,
    upDays: direction.upDays,
    downDays: direction.downDays,
    neutralDays: direction.neutralDays,
    upPercent: Math.round(upPercent * 100) / 100,
    downPercent: Math.round(downPercent * 100) / 100,
  };
}

/**
 * Đếm số ngày tăng/giảm/đi ngang
 */
export function countPriceDirection(
  prices: PriceHistoryPoint[]
): PriceDirection {
  let upDays = 0;
  let downDays = 0;
  let neutralDays = 0;

  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1].price;
    const currPrice = prices[i].price;

    if (currPrice > prevPrice) {
      upDays++;
    } else if (currPrice < prevPrice) {
      downDays++;
    } else {
      neutralDays++;
    }
  }

  return { upDays, downDays, neutralDays };
}

/**
 * Tính trung bình giá theo khoảng thời gian
 */
export function calculateAveragePrice(
  prices: PriceHistoryPoint[],
  period: "day" | "week" | "month"
): { date: Date; average: number }[] {
  if (prices.length === 0) return [];

  const grouped = new Map<string, number[]>();

  prices.forEach((point) => {
    let key: string;
    const date = new Date(point.timestamp);

    switch (period) {
      case "day":
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(point.price);
  });

  return Array.from(grouped.entries())
    .map(([key, values]) => ({
      date: new Date(key),
      average: values.reduce((sum, v) => sum + v, 0) / values.length,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Tính giá trị thay đổi phần trăm giữa 2 giá
 */
export function calculateChangePercent(
  oldPrice: number,
  newPrice: number
): number {
  if (oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

/**
 * Tính giá trị thay đổi tuyệt đối
 */
export function calculateChangeAbsolute(
  oldPrice: number,
  newPrice: number
): number {
  return newPrice - oldPrice;
}

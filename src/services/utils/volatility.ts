import type { PriceHistoryPoint } from "@/types";

export interface VolatilityData {
  date: Date;
  volatility: number;
  price: number;
}

/**
 * Tính độ biến động (volatility) theo khoảng thời gian
 */
export function calculateVolatility(
  prices: PriceHistoryPoint[],
  period: number = 7 // số ngày để tính volatility
): VolatilityData[] {
  if (prices.length < period) return [];

  const result: VolatilityData[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const periodPrices = prices
      .slice(i - period + 1, i + 1)
      .map((p) => p.price);
    const average =
      periodPrices.reduce((sum, p) => sum + p, 0) / periodPrices.length;

    const variance =
      periodPrices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) /
      periodPrices.length;

    const volatility = Math.sqrt(variance);

    result.push({
      date: prices[i].timestamp,
      volatility: Math.round(volatility * 100) / 100,
      price: prices[i].price,
    });
  }

  return result;
}

/**
 * Tính độ biến động trung bình
 */
export function calculateAverageVolatility(
  prices: PriceHistoryPoint[],
  period: number = 7
): number {
  const volatilities = calculateVolatility(prices, period);
  if (volatilities.length === 0) return 0;

  const sum = volatilities.reduce((sum, v) => sum + v.volatility, 0);
  return Math.round((sum / volatilities.length) * 100) / 100;
}

/**
 * Phân loại độ biến động
 */
export function classifyVolatility(
  volatility: number,
  averagePrice: number
): {
  level: "low" | "medium" | "high";
  percentage: number;
} {
  const percentage = (volatility / averagePrice) * 100;

  if (percentage < 1) {
    return { level: "low", percentage };
  } else if (percentage < 3) {
    return { level: "medium", percentage };
  } else {
    return { level: "high", percentage };
  }
}

/**
 * Tính coefficient of variation (CV) - hệ số biến thiên
 */
export function calculateCoefficientOfVariation(
  prices: PriceHistoryPoint[]
): number {
  if (prices.length === 0) return 0;

  const priceValues = prices.map((p) => p.price);
  const average =
    priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;

  if (average === 0) return 0;

  const variance =
    priceValues.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) /
    priceValues.length;
  const stdDev = Math.sqrt(variance);

  return Math.round((stdDev / average) * 100 * 100) / 100; // Return as percentage
}

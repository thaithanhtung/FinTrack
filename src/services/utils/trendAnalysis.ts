import type { PriceHistoryPoint } from "@/types";

export type TrendDirection = "up" | "down" | "sideways";

export interface TrendAnalysis {
  direction: TrendDirection;
  strength: number; // 0-100
  supportLevel?: number;
  resistanceLevel?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
}

/**
 * Tính Simple Moving Average (SMA)
 */
export function calculateSMA(
  prices: PriceHistoryPoint[],
  period: number
): number[] {
  if (prices.length < period) return [];

  const result: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const periodPrices = prices
      .slice(i - period + 1, i + 1)
      .map((p) => p.price);
    const average =
      periodPrices.reduce((sum, p) => sum + p, 0) / periodPrices.length;
    result.push(Math.round(average * 100) / 100);
  }

  return result;
}

/**
 * Tính SMA cho một điểm cụ thể
 */
export function getSMAAtPoint(
  prices: PriceHistoryPoint[],
  index: number,
  period: number
): number | undefined {
  if (index < period - 1 || index >= prices.length) return undefined;

  const periodPrices = prices
    .slice(index - period + 1, index + 1)
    .map((p) => p.price);
  const average =
    periodPrices.reduce((sum, p) => sum + p, 0) / periodPrices.length;

  return Math.round(average * 100) / 100;
}

/**
 * Phân tích xu hướng giá
 */
export function analyzeTrend(prices: PriceHistoryPoint[]): TrendAnalysis {
  if (prices.length < 20) {
    return {
      direction: "sideways",
      strength: 0,
    };
  }

  const priceValues = prices.map((p) => p.price);
  const currentPrice = priceValues[priceValues.length - 1];

  // Tính SMA
  const sma20 = getSMAAtPoint(prices, prices.length - 1, 20);
  const sma50 = getSMAAtPoint(prices, prices.length - 1, 50);
  const sma200 =
    prices.length >= 200
      ? getSMAAtPoint(prices, prices.length - 1, 200)
      : undefined;

  // Xác định điểm hỗ trợ và kháng cự (đơn giản)
  const supportLevel = Math.min(...priceValues.slice(-20));
  const resistanceLevel = Math.max(...priceValues.slice(-20));

  // Phân tích xu hướng dựa trên SMA và giá hiện tại
  let direction: TrendDirection = "sideways";
  let strength = 0;

  if (sma20 && sma50) {
    if (currentPrice > sma20 && sma20 > sma50) {
      direction = "up";
      strength = Math.min(
        100,
        Math.round(((currentPrice - sma50) / sma50) * 100 * 2)
      );
    } else if (currentPrice < sma20 && sma20 < sma50) {
      direction = "down";
      strength = Math.min(
        100,
        Math.round(((sma50 - currentPrice) / sma50) * 100 * 2)
      );
    } else {
      direction = "sideways";
      strength = 30;
    }
  }

  return {
    direction,
    strength: Math.max(0, Math.min(100, strength)),
    supportLevel: Math.round(supportLevel * 100) / 100,
    resistanceLevel: Math.round(resistanceLevel * 100) / 100,
    sma20,
    sma50,
    sma200,
  };
}

/**
 * Dự đoán xu hướng ngắn hạn (đơn giản)
 */
export function predictShortTermTrend(prices: PriceHistoryPoint[]): {
  predictedDirection: TrendDirection;
  confidence: number;
  predictedPrice?: number;
} {
  if (prices.length < 10) {
    return {
      predictedDirection: "sideways",
      confidence: 0,
    };
  }

  // Sử dụng linear regression đơn giản
  const recentPrices = prices.slice(-10).map((p) => p.price);
  const n = recentPrices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = recentPrices;

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictedPrice = slope * n + intercept;
  const currentPrice = recentPrices[recentPrices.length - 1];

  let predictedDirection: TrendDirection = "sideways";
  if (predictedPrice > currentPrice * 1.01) {
    predictedDirection = "up";
  } else if (predictedPrice < currentPrice * 0.99) {
    predictedDirection = "down";
  }

  // Tính confidence dựa trên độ chính xác của trend
  const trendAnalysis = analyzeTrend(prices);
  const confidence = Math.min(80, trendAnalysis.strength + 20);

  return {
    predictedDirection,
    confidence: Math.max(0, Math.min(100, confidence)),
    predictedPrice: Math.round(predictedPrice * 100) / 100,
  };
}

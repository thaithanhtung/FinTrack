import type { ConvertedPrice, SpreadInfo } from '@/types'

// Constants
const GRAMS_PER_LUONG = 37.5 // 1 lượng = 37.5 gram
const GRAMS_PER_TROY_OZ = 31.1035 // 1 troy ounce = 31.1035 gram

/**
 * Quy đổi giá vàng thế giới (USD/oz) sang VND/lượng
 * Công thức: (XAU/USD * Tỷ giá USD/VND * 37.5) / 31.1035
 */
export function convertWorldToVND(
  xauUsdPrice: number,
  usdVndRate: number
): number {
  const pricePerGram = (xauUsdPrice * usdVndRate) / GRAMS_PER_TROY_OZ
  const pricePerLuong = pricePerGram * GRAMS_PER_LUONG
  return Math.round(pricePerLuong)
}

/**
 * Quy đổi giá VND/lượng sang USD/oz
 */
export function convertVNDToWorld(
  vndPerLuong: number,
  usdVndRate: number
): number {
  const pricePerGram = vndPerLuong / GRAMS_PER_LUONG
  const pricePerOz = (pricePerGram * GRAMS_PER_TROY_OZ) / usdVndRate
  return Math.round(pricePerOz * 100) / 100
}

/**
 * So sánh giá vàng thế giới và Việt Nam
 */
export function comparePrices(
  worldPriceUSD: number,
  vnPriceVND: number,
  usdVndRate: number
): ConvertedPrice {
  const worldPriceVND = convertWorldToVND(worldPriceUSD, usdVndRate)
  const difference = vnPriceVND - worldPriceVND
  const differencePercent = (difference / worldPriceVND) * 100
  
  return {
    worldPriceVND,
    vnPrice: vnPriceVND,
    difference,
    differencePercent: Math.round(differencePercent * 100) / 100,
  }
}

/**
 * Tính spread (chênh lệch mua-bán)
 */
export function calculateSpread(
  buyPrice: number,
  sellPrice: number
): SpreadInfo {
  const spread = sellPrice - buyPrice
  const spreadPercent = (spread / buyPrice) * 100
  // Lỗ nếu bán ngay = giá mua - giá bán (của tiệm vàng)
  // Khi mua vàng, ta mua với giá bán của tiệm
  // Khi bán vàng, ta bán với giá mua của tiệm
  const lossIfSellNow = sellPrice - buyPrice
  
  return {
    buyPrice,
    sellPrice,
    spread,
    spreadPercent: Math.round(spreadPercent * 100) / 100,
    lossIfSellNow,
  }
}

/**
 * Tính lợi nhuận/lỗ khi bán vàng
 * @param purchasePrice Giá mua vào (giá bán của tiệm lúc mua)
 * @param currentBuyPrice Giá mua hiện tại của tiệm (giá ta sẽ bán được)
 * @param quantity Số lượng (lượng)
 */
export function calculateProfitLoss(
  purchasePrice: number,
  currentBuyPrice: number,
  quantity: number = 1
): {
  profitLoss: number
  profitLossPercent: number
  isProfit: boolean
} {
  const profitLoss = (currentBuyPrice - purchasePrice) * quantity
  const profitLossPercent = (profitLoss / (purchasePrice * quantity)) * 100
  
  return {
    profitLoss,
    profitLossPercent: Math.round(profitLossPercent * 100) / 100,
    isProfit: profitLoss >= 0,
  }
}

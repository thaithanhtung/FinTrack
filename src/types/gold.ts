// Giá vàng thế giới (XAU/USD)
export interface WorldGoldPrice {
  price: number // USD per troy ounce
  previousClose: number
  change: number
  changePercent: number
  high24h: number
  low24h: number
  timestamp: Date
  source: string
}

// Giá vàng Việt Nam
export interface VNGoldPrice {
  type: GoldType
  brand: GoldBrand
  buyPrice: number // VND
  sellPrice: number // VND
  timestamp: Date
  region?: string
}

export type GoldType = 'SJC' | 'NHAN_9999' | 'NHAN_999' | 'VANG_24K'

export type GoldBrand = 'SJC' | 'DOJI' | 'PNJ' | 'BTMC' | 'OTHER'

// Tỷ giá USD/VND
export interface ExchangeRate {
  usdToVnd: number
  timestamp: Date
  source: string
}

// Dữ liệu biểu đồ
export interface PriceHistoryPoint {
  timestamp: Date
  price: number
  open?: number
  high?: number
  low?: number
  close?: number
}

export type TimeRange = '1D' | '7D' | '1M' | '3M' | '1Y'

// Cảnh báo giá
export interface PriceAlert {
  id: string
  goldType: GoldType | 'XAU'
  brand?: GoldBrand
  condition: AlertCondition
  targetPrice: number
  isActive: boolean
  createdAt: Date
  triggeredAt?: Date
}

export type AlertCondition = 'ABOVE' | 'BELOW'

// API Response types
export interface VNGoldAPIResponse {
  success: boolean
  data: VNGoldAPIData[]
  timestamp: string
}

export interface VNGoldAPIData {
  type: string
  buy: string | number
  sell: string | number
  updated: string
}

export interface WorldGoldAPIResponse {
  success: boolean
  base: string
  timestamp: number
  rates: {
    XAU: number
    USD: number
  }
  price: number
  prev_close_price: number
  ch: number
  chp: number
  high_price: number
  low_price: number
}

// Quy đổi giá
export interface ConvertedPrice {
  worldPriceVND: number // Giá thế giới quy đổi ra VND/lượng
  vnPrice: number // Giá VN
  difference: number // Chênh lệch
  differencePercent: number
}

// Spread (chênh lệch mua-bán)
export interface SpreadInfo {
  buyPrice: number
  sellPrice: number
  spread: number
  spreadPercent: number
  lossIfSellNow: number // Lỗ nếu bán ngay (tính trên 1 lượng)
}

// ============================================
// AI Types
// ============================================

// Gợi ý đầu tư
export type AIRecommendation = 'BUY' | 'SELL' | 'HOLD'

// Snapshot giá tại thời điểm phân tích
export interface AIPriceSnapshot {
  worldPrice: number
  worldChange: number
  worldChangePercent: number
  worldHigh24h: number
  worldLow24h: number
  vnPrice: number
  exchangeRate: number
}

// Kết quả phân tích AI
export interface AIAnalysis {
  content: string
  recommendation: AIRecommendation
  confidence: number // 0-100
  priceSnapshot: AIPriceSnapshot
  createdAt: string
  expiresAt: string
}

// Tin nhắn chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Response từ AI API
export interface AIAnalysisResponse {
  success: boolean
  data?: AIAnalysis
  error?: string
}

export interface AIChatResponse {
  success: boolean
  data?: {
    message: string
  }
  error?: string
}

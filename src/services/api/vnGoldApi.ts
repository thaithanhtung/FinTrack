import type { VNGoldPrice, GoldType, GoldBrand } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib'

// ============================================
// Types for Supabase responses
// ============================================
interface VNGoldPriceRow {
  id: string
  gold_type: string
  brand: string
  buy_price: number
  sell_price: number
  region: string | null
  source: string | null
  created_at: string
}

// ============================================
// Helper function to convert row to VNGoldPrice
// ============================================
function rowToVNGoldPrice(row: VNGoldPriceRow): VNGoldPrice {
  return {
    type: row.gold_type as GoldType,
    brand: row.brand as GoldBrand,
    buyPrice: Number(row.buy_price),
    sellPrice: Number(row.sell_price),
    timestamp: new Date(row.created_at),
    region: row.region || undefined,
  }
}

// ============================================
// Supabase API Functions
// ============================================

/**
 * Lấy tất cả giá vàng Việt Nam mới nhất từ Supabase
 */
export async function fetchVNGoldPrices(): Promise<VNGoldPrice[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local')
  }

  const { data, error } = await supabase
    .from('vn_gold_prices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Lỗi khi lấy giá vàng Việt Nam: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Không có dữ liệu giá vàng Việt Nam. Vui lòng kiểm tra Edge Function đã chạy chưa.')
  }

  const rows = data as VNGoldPriceRow[]

  // Group by brand + gold_type và lấy record mới nhất
  const latestPrices = new Map<string, VNGoldPrice>()
  
  for (const row of rows) {
    const key = `${row.brand}-${row.gold_type}-${row.region || 'default'}`
    
    if (!latestPrices.has(key)) {
      latestPrices.set(key, rowToVNGoldPrice(row))
    }
  }

  return Array.from(latestPrices.values())
}

/**
 * Lấy giá vàng theo loại (SJC, NHAN_9999, etc.)
 */
export async function fetchVNGoldByType(type: GoldType): Promise<VNGoldPrice[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local')
  }

  const { data, error } = await supabase
    .from('vn_gold_prices')
    .select('*')
    .eq('gold_type', type)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(`Lỗi khi lấy giá vàng theo loại: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error(`Không có dữ liệu giá vàng loại ${type}. Vui lòng kiểm tra Edge Function đã chạy chưa.`)
  }

  const rows = data as VNGoldPriceRow[]

  // Group by brand và lấy record mới nhất
  const latestPrices = new Map<string, VNGoldPrice>()
  
  for (const row of rows) {
    const key = `${row.brand}-${row.region || 'default'}`
    
    if (!latestPrices.has(key)) {
      latestPrices.set(key, rowToVNGoldPrice(row))
    }
  }

  return Array.from(latestPrices.values())
}

/**
 * Lấy giá vàng theo thương hiệu (SJC, DOJI, PNJ)
 */
export async function fetchVNGoldByBrand(brand: GoldBrand): Promise<VNGoldPrice[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local')
  }

  const { data, error } = await supabase
    .from('vn_gold_prices')
    .select('*')
    .eq('brand', brand)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(`Lỗi khi lấy giá vàng theo thương hiệu: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error(`Không có dữ liệu giá vàng thương hiệu ${brand}. Vui lòng kiểm tra Edge Function đã chạy chưa.`)
  }

  const rows = data as VNGoldPriceRow[]

  // Group by gold_type và lấy record mới nhất
  const latestPrices = new Map<string, VNGoldPrice>()
  
  for (const row of rows) {
    const key = `${row.gold_type}-${row.region || 'default'}`
    
    if (!latestPrices.has(key)) {
      latestPrices.set(key, rowToVNGoldPrice(row))
    }
  }

  return Array.from(latestPrices.values())
}

/**
 * Lấy giá SJC chính thức (benchmark)
 */
export async function fetchSJCPrice(): Promise<VNGoldPrice | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local')
  }

  const { data, error } = await supabase
    .from('vn_gold_prices')
    .select('*')
    .eq('gold_type', 'SJC')
    .eq('brand', 'SJC')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    throw new Error(`Lỗi khi lấy giá SJC: ${error.message}`)
  }

  if (!data) {
    throw new Error('Không có dữ liệu giá SJC. Vui lòng kiểm tra Edge Function đã chạy chưa.')
  }

  const row = data as VNGoldPriceRow
  return rowToVNGoldPrice(row)
}

/**
 * Lấy giá nhẫn 9999
 */
export async function fetchNhan9999Price(): Promise<VNGoldPrice[]> {
  return fetchVNGoldByType('NHAN_9999')
}

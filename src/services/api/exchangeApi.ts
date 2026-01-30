import type { ExchangeRate } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib'

// ============================================
// Types for Supabase responses
// ============================================
interface ExchangeRateRow {
  id: string
  usd_to_vnd: number
  source: string | null
  created_at: string
}

// ============================================
// Helper function to convert row to ExchangeRate
// ============================================
function rowToExchangeRate(row: ExchangeRateRow): ExchangeRate {
  return {
    usdToVnd: Number(row.usd_to_vnd),
    timestamp: new Date(row.created_at),
    source: row.source || 'Supabase',
  }
}

// ============================================
// Supabase API Functions
// ============================================

/**
 * Lấy tỷ giá USD/VND mới nhất từ Supabase
 */
export async function fetchExchangeRate(): Promise<ExchangeRate> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local')
  }

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    throw new Error(`Lỗi khi lấy tỷ giá: ${error.message}`)
  }

  if (!data) {
    throw new Error('Không có dữ liệu tỷ giá. Vui lòng kiểm tra Edge Function đã chạy chưa.')
  }

  const row = data as ExchangeRateRow
  return rowToExchangeRate(row)
}

/**
 * Lấy lịch sử tỷ giá (cho biểu đồ nếu cần)
 */
export async function fetchExchangeRateHistory(days: number = 30): Promise<ExchangeRate[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Lỗi khi lấy lịch sử tỷ giá: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Không có dữ liệu lịch sử tỷ giá.')
  }

  const rows = data as ExchangeRateRow[]
  return rows.map(rowToExchangeRate)
}

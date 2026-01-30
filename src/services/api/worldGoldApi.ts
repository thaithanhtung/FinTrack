import type { WorldGoldPrice, PriceHistoryPoint, TimeRange } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib';

// ============================================
// Types for Supabase responses
// ============================================
interface WorldGoldPriceRow {
  id: string;
  price: number;
  previous_close: number | null;
  change: number | null;
  change_percent: number | null;
  high_24h: number | null;
  low_24h: number | null;
  source: string | null;
  created_at: string;
}

interface WorldGoldHistoryRow {
  id: string;
  price: number;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  close_price: number | null;
  created_at: string;
}

// ============================================
// Supabase API Functions
// ============================================

/**
 * Lấy giá vàng thế giới mới nhất từ Supabase
 */
export async function fetchWorldGoldPrice(): Promise<WorldGoldPrice> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local'
    );
  }

  const { data, error } = await supabase
    .from('world_gold_prices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Lỗi khi lấy giá vàng thế giới: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      'Không có dữ liệu giá vàng thế giới. Vui lòng kiểm tra Edge Function đã chạy chưa.'
    );
  }

  const row = data as WorldGoldPriceRow;

  return {
    price: Number(row.price),
    previousClose: Number(row.previous_close) || 0,
    change: Number(row.change) || 0,
    changePercent: Number(row.change_percent) || 0,
    high24h: Number(row.high_24h) || 0,
    low24h: Number(row.low_24h) || 0,
    timestamp: new Date(row.created_at),
    source: row.source || 'GoldAPI.io',
  };
}

/**
 * Lấy lịch sử giá vàng thế giới cho biểu đồ
 */
export async function fetchWorldGoldHistory(
  range: TimeRange
): Promise<PriceHistoryPoint[]> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.local'
    );
  }

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case '1D':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7D':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1M':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3M':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1Y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const { data, error } = await supabase
    .from('world_gold_history')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Lỗi khi lấy lịch sử giá vàng: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(
      `Chưa có dữ liệu lịch sử giá vàng cho khoảng thời gian ${range}. Dữ liệu sẽ được tích lũy theo thời gian khi Edge Function chạy.`
    );
  }

  const rows = data as WorldGoldHistoryRow[];

  return rows.map((item) => ({
    timestamp: new Date(item.created_at),
    price: Number(item.price),
    open: item.open_price ? Number(item.open_price) : undefined,
    high: item.high_price ? Number(item.high_price) : undefined,
    low: item.low_price ? Number(item.low_price) : undefined,
    close: item.close_price ? Number(item.close_price) : undefined,
  }));
}

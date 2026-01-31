import type {
  AIAnalysis,
  AIAnalysisResponse,
  AIChatResponse,
  AIPriceSnapshot,
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib';

// ============================================
// AI API Service
// ============================================

const AI_FUNCTION_URL = `${
  import.meta.env.VITE_SUPABASE_URL
}/functions/v1/ai-analysis`;

// Type for Supabase response
interface AIAnalysisCacheRow {
  id: string;
  analysis_type: string;
  content: string;
  recommendation: string | null;
  confidence: number | null;
  price_snapshot: AIPriceSnapshot | null;
  created_at: string;
  expires_at: string;
}

/**
 * Lấy phân tích thị trường từ AI
 */
export async function fetchAIAnalysis(): Promise<AIAnalysis> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình');
  }

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(AI_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({
      action: 'analyze',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const result: AIAnalysisResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Không thể lấy phân tích AI');
  }

  return result.data;
}

/**
 * Chat với AI
 */
export async function sendChatMessage(
  message: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase chưa được cấu hình');
  }

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(AI_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({
      action: 'chat',
      message,
      chatHistory,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Chat error: ${response.status} - ${errorText}`);
  }

  const result: AIChatResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Không thể nhận phản hồi từ AI');
  }

  return result.data.message;
}

/**
 * Lấy phân tích từ cache (nếu có)
 */
export async function getCachedAnalysis(): Promise<AIAnalysis | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('ai_analysis_cache')
    .select('*')
    .eq('analysis_type', 'market_analysis')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as AIAnalysisCacheRow;

  return {
    content: row.content,
    recommendation: (row.recommendation ||
      'HOLD') as AIAnalysis['recommendation'],
    confidence: row.confidence || 50,
    priceSnapshot: row.price_snapshot || {
      worldPrice: 0,
      worldChange: 0,
      worldChangePercent: 0,
      worldHigh24h: 0,
      worldLow24h: 0,
      vnPrice: 0,
      exchangeRate: 25000,
    },
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

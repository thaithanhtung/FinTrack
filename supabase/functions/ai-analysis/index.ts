// Supabase Edge Function: AI Analysis for Gold Market
// Provides market analysis and chatbot functionality using OpenAI
// Deploy: supabase functions deploy ai-analysis

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================
// Types
// ============================================
interface AnalysisRequest {
  action: 'analyze' | 'chat'
  message?: string
  chatHistory?: ChatMessage[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface PriceData {
  worldPrice: number
  worldChange: number
  worldChangePercent: number
  worldHigh24h: number
  worldLow24h: number
  vnPrice: number
  exchangeRate: number
}

interface AnalysisResult {
  content: string
  recommendation: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  priceSnapshot: PriceData
  createdAt: string
  expiresAt: string
}

// ============================================
// OpenAI API Call
// ============================================
async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Không thể tạo phản hồi.'
}

// ============================================
// Get Current Price Data
// ============================================
async function getPriceData(supabase: ReturnType<typeof createClient>): Promise<PriceData> {
  // Get world gold price
  const { data: worldGold } = await supabase
    .from('world_gold_prices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get VN gold price (SJC 1L)
  const { data: vnGold } = await supabase
    .from('vn_gold_prices')
    .select('*')
    .eq('gold_type', 'SJC')
    .eq('region', '1L')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get exchange rate
  const { data: exchangeRate } = await supabase
    .from('exchange_rates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return {
    worldPrice: worldGold?.price || 0,
    worldChange: worldGold?.change || 0,
    worldChangePercent: worldGold?.change_percent || 0,
    worldHigh24h: worldGold?.high_24h || 0,
    worldLow24h: worldGold?.low_24h || 0,
    vnPrice: vnGold?.sell_price || 0,
    exchangeRate: exchangeRate?.usd_to_vnd || 25000,
  }
}

// ============================================
// Market Analysis
// ============================================
async function analyzeMarket(
  supabase: ReturnType<typeof createClient>,
  apiKey: string
): Promise<AnalysisResult> {
  // Check cache first
  const { data: cached } = await supabase
    .from('ai_analysis_cache')
    .select('*')
    .eq('analysis_type', 'market_analysis')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (cached) {
    return {
      content: cached.content,
      recommendation: cached.recommendation as 'BUY' | 'SELL' | 'HOLD',
      confidence: cached.confidence,
      priceSnapshot: cached.price_snapshot as PriceData,
      createdAt: cached.created_at,
      expiresAt: cached.expires_at,
    }
  }

  // Get current price data
  const priceData = await getPriceData(supabase)

  // Create analysis prompt
  const systemPrompt = `Bạn là chuyên gia phân tích thị trường vàng với 20 năm kinh nghiệm. 
Hãy phân tích ngắn gọn và đưa ra gợi ý đầu tư bằng tiếng Việt.
Luôn trả lời theo format JSON với cấu trúc:
{
  "analysis": "Nội dung phân tích 3-4 câu",
  "recommendation": "BUY" hoặc "SELL" hoặc "HOLD",
  "confidence": số từ 0-100 thể hiện độ tin cậy,
  "reason": "Lý do ngắn gọn cho gợi ý"
}`

  const userPrompt = `Phân tích thị trường vàng với dữ liệu sau:
- Giá vàng thế giới: $${priceData.worldPrice.toFixed(2)}/oz
- Thay đổi 24h: ${priceData.worldChange >= 0 ? '+' : ''}${priceData.worldChange.toFixed(2)} (${priceData.worldChangePercent >= 0 ? '+' : ''}${priceData.worldChangePercent.toFixed(2)}%)
- Cao nhất 24h: $${priceData.worldHigh24h.toFixed(2)}
- Thấp nhất 24h: $${priceData.worldLow24h.toFixed(2)}
- Giá vàng SJC Việt Nam: ${(priceData.vnPrice / 1000000).toFixed(2)} triệu VNĐ/lượng
- Tỷ giá USD/VND: ${priceData.exchangeRate.toLocaleString()}

Hãy phân tích xu hướng và đưa ra gợi ý.`

  const aiResponse = await callOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], apiKey)

  // Parse AI response
  let analysis = {
    analysis: aiResponse,
    recommendation: 'HOLD' as const,
    confidence: 50,
    reason: '',
  }

  try {
    // Try to parse JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      analysis = {
        analysis: parsed.analysis || aiResponse,
        recommendation: parsed.recommendation || 'HOLD',
        confidence: parsed.confidence || 50,
        reason: parsed.reason || '',
      }
    }
  } catch {
    // If parsing fails, use raw response
    console.log('Could not parse AI response as JSON, using raw text')
  }

  // Cache the result (expires in 1 hour)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  
  await supabase.from('ai_analysis_cache').insert({
    analysis_type: 'market_analysis',
    content: analysis.analysis + (analysis.reason ? `\n\n${analysis.reason}` : ''),
    recommendation: analysis.recommendation,
    confidence: analysis.confidence,
    price_snapshot: priceData,
    expires_at: expiresAt,
  })

  return {
    content: analysis.analysis + (analysis.reason ? `\n\n${analysis.reason}` : ''),
    recommendation: analysis.recommendation,
    confidence: analysis.confidence,
    priceSnapshot: priceData,
    createdAt: new Date().toISOString(),
    expiresAt,
  }
}

// ============================================
// Chat with AI
// ============================================
async function chatWithAI(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  message: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  // Get current price data for context
  const priceData = await getPriceData(supabase)

  const systemPrompt = `Bạn là trợ lý AI chuyên về thị trường vàng, tên là "Vàng AI". 
Bạn giúp người dùng Việt Nam hiểu về giá vàng, xu hướng thị trường, và đưa ra gợi ý đầu tư.

Thông tin giá vàng hiện tại:
- Giá vàng thế giới: $${priceData.worldPrice.toFixed(2)}/oz (${priceData.worldChangePercent >= 0 ? '+' : ''}${priceData.worldChangePercent.toFixed(2)}%)
- Giá vàng SJC: ${(priceData.vnPrice / 1000000).toFixed(2)} triệu VNĐ/lượng
- Tỷ giá: 1 USD = ${priceData.exchangeRate.toLocaleString()} VNĐ

Quy tắc:
1. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu
2. Luôn nhắc nhở rằng đây chỉ là tham khảo, không phải lời khuyên đầu tư chính thức
3. Nếu không biết, hãy nói thật
4. Giữ câu trả lời dưới 200 từ`

  // Build messages array
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ]

  // Add chat history (last 10 messages)
  const recentHistory = chatHistory.slice(-10)
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content })
  }

  // Add current message
  messages.push({ role: 'user', content: message })

  const response = await callOpenAI(messages, apiKey)
  return response
}

// ============================================
// Main Handler
// ============================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials are not set')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body: AnalysisRequest = await req.json()
    const { action, message, chatHistory } = body

    if (action === 'analyze') {
      const result = await analyzeMarket(supabase, OPENAI_API_KEY)
      return new Response(
        JSON.stringify({
          success: true,
          data: result,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'chat') {
      if (!message) {
        throw new Error('Message is required for chat action')
      }

      const response = await chatWithAI(supabase, OPENAI_API_KEY, message, chatHistory || [])
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            message: response,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid action. Use "analyze" or "chat"')
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

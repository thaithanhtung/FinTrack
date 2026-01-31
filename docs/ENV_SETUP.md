# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## How to Get Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Create a new project (or use existing one)
3. Go to **Project Settings** > **API**
4. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Supabase Edge Functions Secrets

For the Edge Functions to work, you need to set these secrets in Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Set secrets for Edge Functions
supabase secrets set VN_GOLD_API_KEY=your-vnappmob-key
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key
```

## API Sources

### World Gold Prices (Gold-API.com)
- **Không cần API key** - Hoàn toàn miễn phí
- **Không giới hạn requests**
- Tự động lấy giá XAU/USD mỗi 5 phút
- API: `https://api.gold-api.com/price/XAU`
- Docs: https://www.gold-api.com/docs

### VNAppMob (Vietnam Gold Prices)
- Request API key at: https://vapi.vnappmob.com/api/request_api_key?scope=gold
- Key expires after 15 days (need to renew)

### Exchange Rate (exchangerate-api.com)
- **Không cần API key** - Miễn phí
- API: `https://api.exchangerate-api.com/v4/latest/USD`

### OpenAI (AI Analysis & Chatbot)
- Đăng ký tại: https://platform.openai.com
- Tạo API key tại: https://platform.openai.com/api-keys
- Model sử dụng: `gpt-3.5-turbo` (có thể upgrade lên GPT-4)
- Chi phí: ~$0.002 per 1K tokens (rất rẻ)

## AI Features Setup

### 1. Lấy OpenAI API Key

1. Truy cập https://platform.openai.com
2. Đăng ký/Đăng nhập
3. Vào **API Keys** → **Create new secret key**
4. Copy key (bắt đầu bằng `sk-`)

### 2. Set Secret trong Supabase

```bash
supabase secrets set OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Deploy Edge Function

```bash
supabase functions deploy ai-analysis
```

### 4. Tạo bảng AI Cache

Chạy SQL trong Supabase SQL Editor:

```sql
-- Tạo bảng cache cho AI analysis
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  recommendation VARCHAR(20),
  confidence INTEGER,
  price_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis_cache(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_expires ON ai_analysis_cache(expires_at);

-- Enable RLS
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read ai_analysis_cache" ON ai_analysis_cache FOR SELECT USING (true);
CREATE POLICY "Service insert ai_analysis_cache" ON ai_analysis_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update ai_analysis_cache" ON ai_analysis_cache FOR UPDATE USING (true);
CREATE POLICY "Service delete ai_analysis_cache" ON ai_analysis_cache FOR DELETE USING (true);
```

## Notes

- Giá vàng thế giới từ Gold-API.com (miễn phí, không giới hạn)
- Giá vàng Việt Nam từ VNAppMob API (cần API key)
- Tỷ giá USD/VND từ exchangerate-api.com (miễn phí)
- AI Analysis từ OpenAI GPT-3.5 (cần API key, chi phí thấp)
- High/Low 24h và Change được tính từ dữ liệu lịch sử trong database
- AI Analysis được cache 30 phút để tiết kiệm chi phí API

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

# Set secrets for Edge Functions (chỉ cần VN_GOLD_API_KEY)
supabase secrets set VN_GOLD_API_KEY=your-vnappmob-key
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

## Notes

- Giá vàng thế giới từ Gold-API.com (miễn phí, không giới hạn)
- Giá vàng Việt Nam từ VNAppMob API (cần API key)
- Tỷ giá USD/VND từ exchangerate-api.com (miễn phí)
- High/Low 24h và Change được tính từ dữ liệu lịch sử trong database

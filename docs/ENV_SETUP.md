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
supabase secrets set GOLD_API_KEY=your-goldapi-key
supabase secrets set VN_GOLD_API_KEY=your-vnappmob-key
```

## API Keys

### GoldAPI.io (World Gold Prices)
- Sign up at: https://www.goldapi.io/
- Free plan: 100 requests/month
- Get your API key from the dashboard

### VNAppMob (Vietnam Gold Prices)
- Request API key at: https://vapi.vnappmob.com/api/request_api_key?scope=gold
- Key expires after 15 days (need to renew)

## Notes

- Without Supabase credentials, the app will use mock data
- The app gracefully falls back to mock data if API calls fail

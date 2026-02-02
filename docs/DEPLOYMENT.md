# Hướng dẫn Deploy FinTrack

## 📋 Yêu cầu trước khi deploy

- [x] Supabase project đã được setup
- [x] Database schema đã chạy (`supabase/schema.sql`)
- [x] Edge Functions đã được deploy
- [x] API keys đã được cấu hình

---

## 🚀 Deploy Frontend

### Option 1: Deploy lên Vercel (Khuyến nghị)

#### 1. Chuẩn bị

```bash
# Build test local trước
npm run build
npm run preview
```

#### 2. Deploy với Vercel CLI

```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

#### 3. Deploy qua Vercel Dashboard

1. Vào [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import từ GitHub repository
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 4. Environment Variables trong Vercel

Vào **Settings > Environment Variables**, thêm:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 5. Custom Domain (Optional)

1. Vào **Settings > Domains**
2. Add custom domain
3. Cấu hình DNS theo hướng dẫn

---

### Option 2: Deploy lên Netlify

#### 1. Deploy với Netlify CLI

```bash
# Cài đặt Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy

# Deploy production
netlify deploy --prod
```

#### 2. Deploy qua Netlify Dashboard

1. Vào [netlify.com](https://netlify.com)
2. Click **"Add new site" > "Import an existing project"**
3. Connect GitHub repository
4. Cấu hình:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### 3. Environment Variables trong Netlify

Vào **Site settings > Environment variables**, thêm:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 4. Netlify Configuration

Tạo file `netlify.toml` ở root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: Deploy lên Cloudflare Pages

#### 1. Deploy qua Cloudflare Dashboard

1. Vào [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Pages > Create a project**
3. Connect GitHub repository
4. Cấu hình:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

#### 2. Environment Variables

Vào **Settings > Environment variables**, thêm:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🗄️ Setup Supabase Backend

### 1. Tạo Supabase Project

```bash
# Đăng nhập
supabase login

# Link project
supabase link --project-ref your-project-id
```

### 2. Tạo Database Schema

Vào **Supabase Dashboard > SQL Editor**, chạy file:

```bash
# Copy toàn bộ nội dung file supabase/schema.sql và chạy
```

### 3. Deploy Edge Functions

```bash
# Deploy từng function
supabase functions deploy fetch-world-gold
supabase functions deploy fetch-vn-gold
supabase functions deploy fetch-all-prices
supabase functions deploy ai-analysis

# Hoặc deploy tất cả
supabase functions deploy
```

### 4. Set Secrets

```bash
# VNAppMob API key
supabase secrets set VN_GOLD_API_KEY=your-vnappmob-key

# OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
```

### 5. Cấu hình Cron Job

Vào **Database > Extensions**, enable:
- `pg_cron`
- `pg_net`

Sau đó chạy SQL:

```sql
-- Fetch gold prices mỗi 5 phút
SELECT cron.schedule(
  'fetch-gold-prices-every-5-minutes',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-id.supabase.co/functions/v1/fetch-all-prices',
    headers := jsonb_build_object(
      'Authorization', 
      'Bearer your-service-role-key',
      'Content-Type', 
      'application/json'
    )
  ) AS request_id;
  $$
);

-- Kiểm tra cron jobs
SELECT * FROM cron.job;
```

### 6. Verify Cron Job hoạt động

```sql
-- Xem log
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- Kiểm tra data mới nhất
SELECT * FROM world_gold_prices 
ORDER BY created_at DESC 
LIMIT 5;

SELECT * FROM vn_gold_prices 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔧 Post-Deployment Checklist

### Frontend
- [ ] Website accessible qua domain
- [ ] All routes hoạt động (test navigation)
- [ ] Environment variables loaded correctly
- [ ] Dark/Light mode hoạt động
- [ ] Language switching hoạt động
- [ ] API calls thành công

### Backend
- [ ] Database tables đã tạo
- [ ] RLS policies enabled
- [ ] Edge Functions deployed
- [ ] Secrets configured
- [ ] Cron job running (check logs)
- [ ] Data đang được fetch (check tables)

### Testing
- [ ] Giá vàng hiển thị
- [ ] Charts render
- [ ] AI Analysis hoạt động
- [ ] Alerts có thể tạo
- [ ] Export CSV hoạt động
- [ ] Mobile responsive
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

## 🐛 Troubleshooting

### Lỗi: "Failed to fetch gold prices"

**Nguyên nhân**: Cron job không chạy hoặc Edge Function lỗi

**Giải pháp**:
1. Kiểm tra Edge Function logs:
   ```bash
   supabase functions logs fetch-all-prices
   ```
2. Test manual:
   ```bash
   curl -X POST \
     'https://your-project.supabase.co/functions/v1/fetch-all-prices' \
     -H 'Authorization: Bearer your-service-role-key'
   ```

### Lỗi: "AI Analysis not working"

**Nguyên nhân**: OpenAI API key chưa set hoặc hết quota

**Giải pháp**:
1. Verify secret:
   ```bash
   supabase secrets list
   ```
2. Re-set key:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-your-new-key
   ```
3. Redeploy function:
   ```bash
   supabase functions deploy ai-analysis
   ```

### Lỗi: Build failed trên Vercel/Netlify

**Nguyên nhân**: Missing environment variables hoặc TypeScript errors

**Giải pháp**:
1. Check build logs
2. Verify environment variables
3. Test build locally:
   ```bash
   npm run build
   ```

### Lỗi: "Supabase client not initialized"

**Nguyên nhân**: Environment variables không load

**Giải pháp**:
1. Check `.env.local` có đúng format
2. Restart dev server
3. Clear cache: `rm -rf node_modules/.vite`

---

## 📊 Monitoring

### Supabase Dashboard

1. **Database**:
   - Table sizes
   - Query performance
   - Connection pool

2. **Edge Functions**:
   - Invocation count
   - Error rate
   - Response time

3. **Logs**:
   - Function logs
   - Postgres logs
   - API logs

### Vercel Analytics (Optional)

Enable trong Vercel Dashboard:
- Web Vitals
- Real User Monitoring
- Deployment frequency

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🌐 Custom Domain Setup

### 1. Mua domain (khuyến nghị)
- Namecheap
- GoDaddy
- Google Domains

### 2. Cấu hình DNS

Thêm A record hoặc CNAME:

**Vercel**:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Netlify**:
```
Type: CNAME
Name: @
Value: your-site.netlify.app
```

### 3. SSL Certificate

Vercel/Netlify tự động provision SSL certificate miễn phí từ Let's Encrypt.

---

## 📱 PWA Deployment (Coming Soon)

Sau khi thêm PWA support:

1. Update `manifest.json`
2. Add Service Worker
3. Enable HTTPS (required cho PWA)
4. Test installability

---

## 🎉 Done!

Website của bạn đã live tại:
- **Vercel**: `https://your-app.vercel.app`
- **Netlify**: `https://your-app.netlify.app`
- **Custom domain**: `https://yourdomain.com`

---

**Cập nhật**: 1 tháng 2, 2026

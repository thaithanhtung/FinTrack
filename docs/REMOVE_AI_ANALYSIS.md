# Xóa tính năng AI Analysis

## Đã xóa

### Frontend
- ✅ Component: `src/components/ai/` (toàn bộ folder)
  - AIAnalysisCard.tsx
  - ChatMessage.tsx
  - ChatModal.tsx
  - FloatingChatButton.tsx
  - index.ts
- ✅ Hooks: 
  - `src/hooks/useAIAnalysis.ts`
  - `src/hooks/useAIChat.ts`
- ✅ API: `src/services/api/aiApi.ts`
- ✅ Types: AI-related types trong `src/types/gold.ts`
- ✅ Skeleton: `AIAnalysisCardSkeleton` trong `src/components/common/Skeletons.tsx`
- ✅ Import từ `Home.tsx`

### Backend (Local)
- ✅ Edge Function: `supabase/functions/ai-analysis/` (folder xóa)
- ✅ Config: Entry `[functions.ai-analysis]` xóa từ `supabase/config.toml`
- ✅ Migration: Tạo file `supabase/migrations/remove_ai_analysis.sql`

## Cần thực hiện trên Supabase Production

### 1. Chạy Migration

Mở Supabase Dashboard → SQL Editor → Chạy lệnh sau:

```sql
-- Drop functions
DROP FUNCTION IF EXISTS get_cached_analysis(VARCHAR);
DROP FUNCTION IF EXISTS cleanup_expired_ai_cache();

-- Drop policies
DROP POLICY IF EXISTS "Public read ai_analysis_cache" ON ai_analysis_cache;
DROP POLICY IF EXISTS "Service insert ai_analysis_cache" ON ai_analysis_cache;
DROP POLICY IF EXISTS "Service update ai_analysis_cache" ON ai_analysis_cache;
DROP POLICY IF EXISTS "Service delete ai_analysis_cache" ON ai_analysis_cache;

-- Drop indexes
DROP INDEX IF EXISTS idx_ai_analysis_type;
DROP INDEX IF EXISTS idx_ai_analysis_expires;

-- Drop table
DROP TABLE IF EXISTS ai_analysis_cache;
```

### 2. Xóa Edge Function (nếu đã deploy)

```bash
# Nếu đã deploy function ai-analysis lên production
supabase functions delete ai-analysis
```

### 3. Verify

Kiểm tra lại trong Supabase Dashboard:

#### Database → Tables
- ❌ `ai_analysis_cache` (phải không tồn tại)

#### Database → Functions
- ❌ `get_cached_analysis()` (phải không tồn tại)
- ❌ `cleanup_expired_ai_cache()` (phải không tồn tại)

#### Edge Functions
- ❌ `ai-analysis` (phải không tồn tại trong list)

## Lý do xóa

- ❌ Auto-fetch mỗi 5 phút tốn resources
- ❌ Không cần thiết cho MVP
- ❌ API calls tốn cost
- ❌ User không tương tác nhiều với tính năng này

## Có thể khôi phục sau nếu cần

- Các files đã xóa vẫn còn trong git history
- Database schema trong `supabase/schema.sql` (lines 186-215)
- Edge Function code có thể khôi phục từ commit trước

## Kiểm tra app sau khi xóa

```bash
# Local dev
npm run dev

# Check console không có error về AI imports
# Navigate qua các pages:
# - Home (không còn AI Analysis card)
# - Charts
# - Converter
# - Alerts
```

## Expected result

### Home Page trước:
```
[World Gold Card]
[AI Analysis Card]  ← XÓA
[Trend Analysis]
[Price Comparison]
[Spread Calculator]
[VN Gold Card]
```

### Home Page sau:
```
[World Gold Card]
[Trend Analysis]
[Price Comparison]
[Spread Calculator]
[VN Gold Card]
```

✅ Clean, simple, no auto-fetching, save resources!

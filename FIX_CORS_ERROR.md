# Fix CORS Error - Test Telegram

## ❌ Lỗi hiện tại

```
CORS error khi click Test button
```

## ✅ Giải pháp

### Bước 1: Deploy/Redeploy Function

Function đã có CORS headers đúng, nhưng cần deploy:

```bash
cd /Users/tungthai/Desktop/FinTrack

# Deploy function với CORS support
supabase functions deploy test-telegram --no-verify-jwt

# Verify deployment
supabase functions list
```

### Bước 2: Verify Function URL

Check xem function có accessible không:

```bash
# Test function qua curl
curl -X POST https://bjdwukzwysxtrltgnlsx.supabase.co/functions/v1/test-telegram \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"chatId":"123456789"}'
```

**Lấy ANON_KEY:**
- Mở `.env.local`
- Copy value của `VITE_SUPABASE_ANON_KEY`

### Bước 3: Alternative - Test từ Supabase Dashboard

Nếu vẫn lỗi CORS:

1. Mở Supabase Dashboard
2. Vào **Edge Functions**
3. Chọn `test-telegram`
4. Click **Invoke**
5. Body: `{"chatId":"123456789"}`
6. Click **Invoke function**

## 🔍 Debug

Nếu vẫn lỗi, check console error message:

### Error 1: Function not found
```
Error: Function test-telegram not found
```
**Fix:** Deploy function (Bước 1)

### Error 2: CORS preflight error
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Fix:** Function đã có CORS headers, chỉ cần redeploy

### Error 3: Network error
```
Failed to fetch
```
**Fix:** Check Supabase connection, verify PROJECT_URL

## 🧪 Test sau khi deploy

1. Refresh page `/daily-report`
2. Nhập Chat ID
3. Click "Test thử"
4. Đợi vài giây
5. Check kết quả

## 📊 Expected Response

**Success:**
```json
{
  "success": true,
  "message": "Test message sent successfully",
  "chatId": "123456789"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Chat ID không hợp lệ..."
}
```

## 🚀 Quick Fix Command

```bash
cd /Users/tungthai/Desktop/FinTrack && \
supabase functions deploy test-telegram --no-verify-jwt && \
echo "✅ Function deployed! Test lại trên UI ngay."
```

---

**Chạy lệnh trên và test lại!** 🎯

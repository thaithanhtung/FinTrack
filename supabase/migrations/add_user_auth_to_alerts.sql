-- =============================================
-- Add User Authentication to Price Alerts
-- =============================================

-- Add user_id column to price_alerts
ALTER TABLE price_alerts 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can read own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Users can insert alerts" ON price_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON price_alerts;
DROP POLICY IF EXISTS "Service role full access" ON price_alerts;

-- =============================================
-- New RLS Policies based on authenticated user
-- =============================================

-- Users can only read their own alerts
CREATE POLICY "Users can read own alerts" ON price_alerts 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert alerts for themselves
CREATE POLICY "Users can insert own alerts" ON price_alerts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own alerts
CREATE POLICY "Users can update own alerts" ON price_alerts 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own alerts
CREATE POLICY "Users can delete own alerts" ON price_alerts 
  FOR DELETE USING (auth.uid() = user_id);

-- Service role has full access (for Edge Functions)
CREATE POLICY "Service role full access on alerts" ON price_alerts 
  FOR ALL USING (true);

-- =============================================
-- Optional: Backfill existing alerts
-- =============================================
-- If you have existing alerts without user_id, you can either:
-- 1. Delete them: DELETE FROM price_alerts WHERE user_id IS NULL;
-- 2. Assign to a default user (create one first in Supabase Auth)
-- UPDATE price_alerts SET user_id = 'default-user-uuid' WHERE user_id IS NULL;

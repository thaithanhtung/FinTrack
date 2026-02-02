-- =============================================
-- Remove AI Analysis Feature
-- =============================================
-- Run this migration to completely remove AI analysis functionality
-- Date: 2026-02-01

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

-- Note: Edge Function ai-analysis should be manually deleted via CLI:
-- supabase functions delete ai-analysis

-- Migration: Add daily report settings to user_profiles
-- Description: Adds fields for daily report scheduling and preferences

-- Add new columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS daily_report_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS report_time TIME DEFAULT '07:00:00';

-- Create index for faster queries on enabled reports
CREATE INDEX IF NOT EXISTS idx_user_profiles_daily_report 
ON user_profiles(daily_report_enabled, report_time) 
WHERE daily_report_enabled = true;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.daily_report_enabled IS 'Whether user wants to receive daily gold price reports';
COMMENT ON COLUMN user_profiles.report_time IS 'Time of day (HH:MM:SS) when user wants to receive daily reports';

-- Update existing users to have default values
UPDATE user_profiles 
SET 
  daily_report_enabled = true,
  report_time = '07:00:00'
WHERE daily_report_enabled IS NULL OR report_time IS NULL;

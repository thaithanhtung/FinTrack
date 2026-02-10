-- =============================================
-- User Profiles Table
-- Store additional user information including Telegram Chat ID
-- =============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  telegram_chat_id VARCHAR(100),
  telegram_username VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for telegram_chat_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_chat_id ON user_profiles(telegram_chat_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (triggered after signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role has full access
CREATE POLICY "Service role full access on profiles" ON user_profiles
  FOR ALL USING (true);

-- =============================================
-- Trigger to auto-create profile on user signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to update telegram_chat_id
CREATE OR REPLACE FUNCTION update_telegram_chat_id(p_user_id UUID, p_chat_id VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET telegram_chat_id = p_chat_id,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user by telegram_chat_id
CREATE OR REPLACE FUNCTION get_user_by_telegram_chat_id(p_chat_id VARCHAR)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  telegram_username VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, email, telegram_username
  FROM user_profiles
  WHERE telegram_chat_id = p_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

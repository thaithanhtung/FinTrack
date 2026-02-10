-- =============================================
-- Price Alerts Table for Telegram Notifications
-- =============================================

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id VARCHAR(100) NOT NULL,
  gold_type VARCHAR(20) NOT NULL,
  brand VARCHAR(20),
  condition VARCHAR(10) NOT NULL CHECK (condition IN ('ABOVE', 'BELOW')),
  target_price DECIMAL(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active, telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_gold_type ON price_alerts(gold_type, is_active);
CREATE INDEX IF NOT EXISTS idx_price_alerts_created ON price_alerts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Public can read their own alerts (by matching chat_id)
-- Note: Since we don't have user authentication, we rely on chat_id
CREATE POLICY "Users can read own alerts" ON price_alerts 
  FOR SELECT USING (true);

-- Public can insert alerts
CREATE POLICY "Users can insert alerts" ON price_alerts 
  FOR INSERT WITH CHECK (true);

-- Public can update their own alerts (by matching chat_id)
CREATE POLICY "Users can update own alerts" ON price_alerts 
  FOR UPDATE USING (true);

-- Public can delete their own alerts (by matching chat_id)
CREATE POLICY "Users can delete own alerts" ON price_alerts 
  FOR DELETE USING (true);

-- Service role has full access (for Edge Functions)
CREATE POLICY "Service role full access" ON price_alerts 
  FOR ALL USING (true);

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get active alerts for checking
CREATE OR REPLACE FUNCTION get_active_price_alerts()
RETURNS TABLE (
  id UUID,
  telegram_chat_id VARCHAR(100),
  gold_type VARCHAR(20),
  brand VARCHAR(20),
  condition VARCHAR(10),
  target_price DECIMAL(12,2),
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.telegram_chat_id, a.gold_type, a.brand, 
         a.condition, a.target_price, a.created_at
  FROM price_alerts a
  WHERE a.is_active = true
  ORDER BY a.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to trigger an alert (set as inactive and record time)
CREATE OR REPLACE FUNCTION trigger_price_alert(p_alert_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE price_alerts
  SET is_active = false,
      triggered_at = NOW()
  WHERE id = p_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get alerts by chat ID
CREATE OR REPLACE FUNCTION get_alerts_by_chat_id(p_chat_id VARCHAR)
RETURNS TABLE (
  id UUID,
  telegram_chat_id VARCHAR(100),
  gold_type VARCHAR(20),
  brand VARCHAR(20),
  condition VARCHAR(10),
  target_price DECIMAL(12,2),
  is_active BOOLEAN,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.telegram_chat_id, a.gold_type, a.brand, 
         a.condition, a.target_price, a.is_active, a.triggered_at, a.created_at
  FROM price_alerts a
  WHERE a.telegram_chat_id = p_chat_id
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

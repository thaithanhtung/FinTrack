-- =============================================
-- FinTrack Database Schema for Supabase
-- =============================================

-- Bảng giá vàng thế giới (XAU/USD)
CREATE TABLE IF NOT EXISTS world_gold_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  price DECIMAL(10,2) NOT NULL,
  previous_close DECIMAL(10,2),
  change DECIMAL(10,2),
  change_percent DECIMAL(5,2),
  high_24h DECIMAL(10,2),
  low_24h DECIMAL(10,2),
  source VARCHAR(50) DEFAULT 'GoldAPI.io',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng giá vàng Việt Nam
CREATE TABLE IF NOT EXISTS vn_gold_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gold_type VARCHAR(20) NOT NULL,
  brand VARCHAR(20) NOT NULL,
  buy_price BIGINT NOT NULL,
  sell_price BIGINT NOT NULL,
  region VARCHAR(10),
  source VARCHAR(50) DEFAULT 'VNAppMob',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng tỷ giá USD/VND
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usd_to_vnd DECIMAL(10,2) NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng lịch sử giá vàng thế giới (cho biểu đồ)
CREATE TABLE IF NOT EXISTS world_gold_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  price DECIMAL(10,2) NOT NULL,
  open_price DECIMAL(10,2),
  high_price DECIMAL(10,2),
  low_price DECIMAL(10,2),
  close_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes cho query nhanh
-- =============================================
CREATE INDEX IF NOT EXISTS idx_world_gold_created ON world_gold_prices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vn_gold_created ON vn_gold_prices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_created ON exchange_rates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_world_gold_history_created ON world_gold_history(created_at DESC);

-- Index cho filter theo brand và type
CREATE INDEX IF NOT EXISTS idx_vn_gold_brand ON vn_gold_prices(brand);
CREATE INDEX IF NOT EXISTS idx_vn_gold_type ON vn_gold_prices(gold_type);

-- =============================================
-- Enable Row Level Security (RLS)
-- =============================================
ALTER TABLE world_gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vn_gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_gold_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies - Public Read Access
-- =============================================
CREATE POLICY "Public read world_gold_prices" ON world_gold_prices 
  FOR SELECT USING (true);

CREATE POLICY "Public read vn_gold_prices" ON vn_gold_prices 
  FOR SELECT USING (true);

CREATE POLICY "Public read exchange_rates" ON exchange_rates 
  FOR SELECT USING (true);

CREATE POLICY "Public read world_gold_history" ON world_gold_history 
  FOR SELECT USING (true);

-- =============================================
-- Service Role Insert Policies (for Edge Functions)
-- =============================================
CREATE POLICY "Service insert world_gold_prices" ON world_gold_prices 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service insert vn_gold_prices" ON vn_gold_prices 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service insert exchange_rates" ON exchange_rates 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service insert world_gold_history" ON world_gold_history 
  FOR INSERT WITH CHECK (true);

-- =============================================
-- Function để lấy giá mới nhất
-- =============================================
CREATE OR REPLACE FUNCTION get_latest_world_gold()
RETURNS TABLE (
  id UUID,
  price DECIMAL(10,2),
  previous_close DECIMAL(10,2),
  change DECIMAL(10,2),
  change_percent DECIMAL(5,2),
  high_24h DECIMAL(10,2),
  low_24h DECIMAL(10,2),
  source VARCHAR(50),
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.price, w.previous_close, w.change, w.change_percent, 
         w.high_24h, w.low_24h, w.source, w.created_at
  FROM world_gold_prices w
  ORDER BY w.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function để lấy giá VN mới nhất (grouped by brand và type)
CREATE OR REPLACE FUNCTION get_latest_vn_gold()
RETURNS TABLE (
  id UUID,
  gold_type VARCHAR(20),
  brand VARCHAR(20),
  buy_price BIGINT,
  sell_price BIGINT,
  region VARCHAR(10),
  source VARCHAR(50),
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (v.brand, v.gold_type) 
         v.id, v.gold_type, v.brand, v.buy_price, v.sell_price, 
         v.region, v.source, v.created_at
  FROM vn_gold_prices v
  ORDER BY v.brand, v.gold_type, v.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function để lấy tỷ giá mới nhất
CREATE OR REPLACE FUNCTION get_latest_exchange_rate()
RETURNS TABLE (
  id UUID,
  usd_to_vnd DECIMAL(10,2),
  source VARCHAR(50),
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.usd_to_vnd, e.source, e.created_at
  FROM exchange_rates e
  ORDER BY e.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Cleanup old data (optional - run periodically)
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_prices()
RETURNS void AS $$
BEGIN
  -- Giữ lại 7 ngày dữ liệu cho world_gold_prices
  DELETE FROM world_gold_prices 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Giữ lại 7 ngày dữ liệu cho vn_gold_prices
  DELETE FROM vn_gold_prices 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Giữ lại 1 năm dữ liệu cho history
  DELETE FROM world_gold_history 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Migration: Add VN Gold History Table and Statistics Functions
-- Date: 2026-02-01
-- =============================================

-- =============================================
-- VN Gold History Table (for historical analysis)
-- =============================================
CREATE TABLE IF NOT EXISTS vn_gold_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gold_type VARCHAR(20) NOT NULL,
  brand VARCHAR(20) NOT NULL,
  buy_price BIGINT NOT NULL,
  sell_price BIGINT NOT NULL,
  region VARCHAR(10),
  source VARCHAR(50) DEFAULT 'VNAppMob',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vn_gold_history
CREATE INDEX IF NOT EXISTS idx_vn_gold_history_created ON vn_gold_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vn_gold_history_brand ON vn_gold_history(brand);
CREATE INDEX IF NOT EXISTS idx_vn_gold_history_type ON vn_gold_history(gold_type);
CREATE INDEX IF NOT EXISTS idx_vn_gold_history_brand_type ON vn_gold_history(brand, gold_type, created_at DESC);

-- Enable RLS
ALTER TABLE vn_gold_history ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read vn_gold_history" ON vn_gold_history 
  FOR SELECT USING (true);

-- Service role insert
CREATE POLICY "Service insert vn_gold_history" ON vn_gold_history 
  FOR INSERT WITH CHECK (true);

-- =============================================
-- Statistics Functions
-- =============================================

-- Function: Calculate average price for a time period
CREATE OR REPLACE FUNCTION get_average_price(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_type VARCHAR DEFAULT 'world' -- 'world' or 'vn'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  avg_price DECIMAL(10,2);
BEGIN
  IF p_type = 'world' THEN
    SELECT AVG(price) INTO avg_price
    FROM world_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date;
  ELSE
    SELECT AVG(sell_price) INTO avg_price
    FROM vn_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date
      AND gold_type = 'SJC' AND brand = 'SJC';
  END IF;
  
  RETURN COALESCE(avg_price, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Get high/low price for a time period
CREATE OR REPLACE FUNCTION get_price_range(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_type VARCHAR DEFAULT 'world'
)
RETURNS TABLE (
  high_price DECIMAL(10,2),
  low_price DECIMAL(10,2)
) AS $$
BEGIN
  IF p_type = 'world' THEN
    RETURN QUERY
    SELECT MAX(price)::DECIMAL(10,2), MIN(price)::DECIMAL(10,2)
    FROM world_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date;
  ELSE
    RETURN QUERY
    SELECT MAX(sell_price)::DECIMAL(10,2), MIN(sell_price)::DECIMAL(10,2)
    FROM vn_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date
      AND gold_type = 'SJC' AND brand = 'SJC';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate volatility (standard deviation)
CREATE OR REPLACE FUNCTION calculate_volatility(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_type VARCHAR DEFAULT 'world'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  volatility DECIMAL(10,2);
BEGIN
  IF p_type = 'world' THEN
    SELECT STDDEV(price) INTO volatility
    FROM world_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date;
  ELSE
    SELECT STDDEV(sell_price) INTO volatility
    FROM vn_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date
      AND gold_type = 'SJC' AND brand = 'SJC';
  END IF;
  
  RETURN COALESCE(volatility, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Count up/down days
CREATE OR REPLACE FUNCTION count_price_direction(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_type VARCHAR DEFAULT 'world'
)
RETURNS TABLE (
  up_days INTEGER,
  down_days INTEGER,
  neutral_days INTEGER
) AS $$
DECLARE
  up_count INTEGER := 0;
  down_count INTEGER := 0;
  neutral_count INTEGER := 0;
  prev_price DECIMAL(10,2);
  curr_price DECIMAL(10,2);
  price_rec RECORD;
BEGIN
  IF p_type = 'world' THEN
    FOR price_rec IN
      SELECT price, created_at
      FROM world_gold_history
      WHERE created_at >= p_start_date AND created_at <= p_end_date
      ORDER BY created_at ASC
    LOOP
      IF prev_price IS NOT NULL THEN
        IF price_rec.price > prev_price THEN
          up_count := up_count + 1;
        ELSIF price_rec.price < prev_price THEN
          down_count := down_count + 1;
        ELSE
          neutral_count := neutral_count + 1;
        END IF;
      END IF;
      prev_price := price_rec.price;
    END LOOP;
  ELSE
    FOR price_rec IN
      SELECT sell_price as price, created_at
      FROM vn_gold_history
      WHERE created_at >= p_start_date AND created_at <= p_end_date
        AND gold_type = 'SJC' AND brand = 'SJC'
      ORDER BY created_at ASC
    LOOP
      IF prev_price IS NOT NULL THEN
        IF price_rec.price > prev_price THEN
          up_count := up_count + 1;
        ELSIF price_rec.price < prev_price THEN
          down_count := down_count + 1;
        ELSE
          neutral_count := neutral_count + 1;
        END IF;
      END IF;
      prev_price := price_rec.price;
    END LOOP;
  END IF;
  
  RETURN QUERY SELECT up_count, down_count, neutral_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get price statistics summary
CREATE OR REPLACE FUNCTION get_price_statistics(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_type VARCHAR DEFAULT 'world'
)
RETURNS TABLE (
  avg_price DECIMAL(10,2),
  high_price DECIMAL(10,2),
  low_price DECIMAL(10,2),
  volatility DECIMAL(10,2),
  total_records BIGINT
) AS $$
BEGIN
  IF p_type = 'world' THEN
    RETURN QUERY
    SELECT 
      AVG(price)::DECIMAL(10,2),
      MAX(price)::DECIMAL(10,2),
      MIN(price)::DECIMAL(10,2),
      STDDEV(price)::DECIMAL(10,2),
      COUNT(*)::BIGINT
    FROM world_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date;
  ELSE
    RETURN QUERY
    SELECT 
      AVG(sell_price)::DECIMAL(10,2),
      MAX(sell_price)::DECIMAL(10,2),
      MIN(sell_price)::DECIMAL(10,2),
      STDDEV(sell_price)::DECIMAL(10,2),
      COUNT(*)::BIGINT
    FROM vn_gold_history
    WHERE created_at >= p_start_date AND created_at <= p_end_date
      AND gold_type = 'SJC' AND brand = 'SJC';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PT Fuji Seat Indonesia - STO Database Schema
-- Production Management System with Supabase
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Production Sessions Table
CREATE TABLE IF NOT EXISTS production_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Production Data Table
CREATE TABLE IF NOT EXISTS production_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES production_sessions(id) ON DELETE CASCADE,
  kode_inject VARCHAR(50) NOT NULL,
  inject_index INTEGER NOT NULL,
  
  -- Stock Production Data
  stock_awal DECIMAL(10,2) DEFAULT 0,
  produksi DECIMAL(10,2) DEFAULT 0,
  surcip DECIMAL(10,2) DEFAULT 0,
  sunter DECIMAL(10,2) DEFAULT 0,
  kiic DECIMAL(10,2) DEFAULT 0,
  
  -- Box Calculation Data
  act_box TEXT DEFAULT '', -- JSON array format: "10,20,30"
  stdrt_pack DECIMAL(10,2) DEFAULT 0,
  act_qty DECIMAL(10,2) DEFAULT 0,
  gap_value DECIMAL(10,2) DEFAULT 0,
  
  -- Stock Strength Data  
  stock_reguler DECIMAL(10,2) DEFAULT 0,
  anzen_stock DECIMAL(10,2) DEFAULT 0,
  fc2d DECIMAL(10,2) DEFAULT 0,
  kekuatan_stock DECIMAL(10,2) DEFAULT 0,
  kekuatan_anzen DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(session_id, inject_index)
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_night_mode BOOLEAN DEFAULT FALSE,
  current_view VARCHAR(20) DEFAULT 'main',
  last_session_id UUID REFERENCES production_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =============================================
-- INDEXES
-- =============================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_production_data_session_id ON production_data(session_id);
CREATE INDEX IF NOT EXISTS idx_production_data_inject_index ON production_data(inject_index);
CREATE INDEX IF NOT EXISTS idx_production_sessions_created_by ON production_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_production_sessions_active ON production_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_production_sessions_created_at ON production_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_production_data_updated_at ON production_data(updated_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE production_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for production_sessions
CREATE POLICY "Users can view own sessions" ON production_sessions
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create own sessions" ON production_sessions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own sessions" ON production_sessions
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own sessions" ON production_sessions
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for production_data
CREATE POLICY "Users can view production data" ON production_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM production_sessions 
      WHERE id = production_data.session_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage production data" ON production_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM production_sessions 
      WHERE id = production_data.session_id 
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for user_settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_production_sessions_updated_at 
  BEFORE UPDATE ON production_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_data_updated_at 
  BEFORE UPDATE ON production_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert sample KODE_INJECT values (will be done by application)
-- The application will initialize with proper KODE_INJECT from constants

-- =============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Function to calculate ACT QTY from ACT BOX
CREATE OR REPLACE FUNCTION calculate_act_qty(act_box TEXT, stdrt_pack DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  box_array TEXT[];
  box_value DECIMAL;
  total_boxes DECIMAL := 0;
BEGIN
  IF act_box IS NULL OR act_box = '' OR stdrt_pack = 0 THEN
    RETURN 0;
  END IF;
  
  -- Split comma-separated values
  box_array := string_to_array(act_box, ',');
  
  -- Sum all box values
  FOREACH box_value IN ARRAY box_array LOOP
    total_boxes := total_boxes + COALESCE(box_value::DECIMAL, 0);
  END LOOP;
  
  RETURN total_boxes * stdrt_pack;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate GAP
CREATE OR REPLACE FUNCTION calculate_gap(
  act_qty DECIMAL,
  stock_awal DECIMAL,
  produksi DECIMAL,
  surcip DECIMAL,
  sunter DECIMAL,
  kiic DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN act_qty - (stock_awal + produksi - surcip - sunter - kiic);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate Kekuatan Stock
CREATE OR REPLACE FUNCTION calculate_kekuatan_stock(stock_value DECIMAL, fc2d DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF fc2d = 0 THEN
    RETURN 0;
  END IF;
  RETURN stock_value / fc2d;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS (Optional - for reporting)
-- =============================================

-- View for complete production report
CREATE OR REPLACE VIEW production_report AS
SELECT 
  ps.session_name,
  ps.created_by,
  ps.created_at as session_created,
  pd.kode_inject,
  pd.inject_index,
  pd.stock_awal,
  pd.produksi,
  pd.surcip,
  pd.sunter,
  pd.kiic,
  pd.act_box,
  pd.stdrt_pack,
  pd.act_qty,
  pd.gap_value,
  pd.stock_reguler,
  pd.anzen_stock,
  pd.fc2d,
  pd.kekuatan_stock,
  pd.kekuatan_anzen,
  pd.updated_at as last_updated
FROM production_sessions ps
JOIN production_data pd ON ps.id = pd.session_id
WHERE ps.is_active = TRUE
ORDER BY ps.created_at DESC, pd.inject_index ASC;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE production_sessions IS 'Production sessions for organizing data by time period or shift';
COMMENT ON TABLE production_data IS 'Main production data with stock, box calculation, and strength analysis';
COMMENT ON TABLE user_settings IS 'User preferences and last session information';

COMMENT ON COLUMN production_data.act_box IS 'Comma-separated box values, e.g., "10,20,30"';
COMMENT ON COLUMN production_data.gap_value IS 'Calculated: ACT QTY - (STOCK AWAL + PRODUKSI - SURCIP - SUNTER - KIIC)';
COMMENT ON COLUMN production_data.kekuatan_stock IS 'Calculated: STOCK REGULER / F/C 2D';
COMMENT ON COLUMN production_data.kekuatan_anzen IS 'Calculated: ANZEN STOCK / F/C 2D';

-- =============================================
-- END OF SCHEMA
-- =============================================
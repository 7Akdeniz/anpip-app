-- ============================================================================
-- 📊 FEHLENDE SETTINGS-TABELLEN - Anpip.com
-- ============================================================================
-- Ergänzung zur bestehenden settings_tables Migration
-- ============================================================================

-- Problem Reports Table
CREATE TABLE IF NOT EXISTS problem_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('bug', 'upload', 'video', 'account', 'payment', 'privacy', 'other')),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- User Feedback Table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('feature', 'improvement', 'compliment', 'general')),
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'implemented', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
  description TEXT,
  pdf_url TEXT,
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appearance Settings Table (ergänzt die bestehenden)
CREATE TABLE IF NOT EXISTS appearance_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  font_size VARCHAR(10) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  animations VARCHAR(10) DEFAULT 'normal' CHECK (animations IN ('normal', 'reduced', 'none')),
  accessibility_mode BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_problem_reports_user_id ON problem_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_reports_status ON problem_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_appearance_settings_user_id ON appearance_settings(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Problem Reports RLS
ALTER TABLE problem_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY problem_reports_select_own ON problem_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY problem_reports_insert_own ON problem_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY problem_reports_update_own ON problem_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- User Feedback RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_feedback_select_own ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_feedback_insert_own ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_feedback_update_own ON user_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Invoices RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoices_select_own ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Appearance Settings RLS
ALTER TABLE appearance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY appearance_settings_select_own ON appearance_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY appearance_settings_insert_own ON appearance_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY appearance_settings_update_own ON appearance_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER FUNCTIONS (Auto-update updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_problem_reports_updated_at BEFORE UPDATE ON problem_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_feedback_updated_at BEFORE UPDATE ON user_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appearance_settings_updated_at BEFORE UPDATE ON appearance_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEMO DATA (Optional - für Testing)
-- ============================================================================

-- Funktion zum Generieren von Demo-Rechnungen
CREATE OR REPLACE FUNCTION generate_demo_invoice(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number VARCHAR(50);
BEGIN
  -- Generiere eindeutige Rechnungsnummer
  v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::TEXT, 4, '0');
  
  -- Erstelle Rechnung
  INSERT INTO invoices (user_id, invoice_number, amount, description)
  VALUES (
    p_user_id,
    v_invoice_number,
    29.99,
    'Anpip Premium - Monatlich'
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Kommentar für Dokumentation
COMMENT ON TABLE problem_reports IS 'Speichert Problem-Meldungen von Benutzern';
COMMENT ON TABLE user_feedback IS 'Speichert Feedback und Feature-Wünsche';
COMMENT ON TABLE invoices IS 'Speichert Rechnungen für Premium-Abonnements';
COMMENT ON TABLE appearance_settings IS 'Speichert UI/UX-Einstellungen der Benutzer';

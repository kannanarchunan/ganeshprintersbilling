-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PLACES TABLE
CREATE TABLE places (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BILLS TABLE
CREATE TABLE bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  bill_number TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  notes TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(place_id, bill_number)
);

-- ACTIVITY LOGS TABLE
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action_type TEXT NOT NULL,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  place_name TEXT,
  bill_number TEXT,
  amount NUMERIC(12,2),
  status TEXT,
  modified_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_bills_place_id ON bills(place_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- ROW LEVEL SECURITY
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (authenticated users only)
CREATE POLICY "Auth users can read places" ON places FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert places" ON places FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update places" ON places FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete places" ON places FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can read bills" ON bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert bills" ON bills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update bills" ON bills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete bills" ON bills FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users can read logs" ON activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

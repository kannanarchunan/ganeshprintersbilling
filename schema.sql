-- Supabase Database Schema
-- Ganesh Printers Billing Management System

-- Drop existing tables if they exist
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS places CASCADE;

-- 1. PLACES TABLE
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast alphabetical queries
CREATE INDEX idx_places_name ON places(name ASC);

-- 2. BILLS TABLE
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    bill_number TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    notes TEXT,
    
    -- Prevent duplicate bill numbers within the same place
    CONSTRAINT unique_place_bill_number UNIQUE (place_id, bill_number)
);

-- Indexes for performance
CREATE INDEX idx_bills_place_id ON bills(place_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_created_at ON bills(created_at DESC);

-- 3. ACTIVITY LOGS TABLE
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL, -- 'CREATE_PLACE', 'UPDATE_PLACE', 'DELETE_PLACE', 'CREATE_BILL', 'UPDATE_BILL', 'DELETE_BILL', 'COMPLETE_BILL'
    bill_id UUID,
    place_id UUID,
    bill_number TEXT,
    place_name TEXT,
    amount NUMERIC(12, 2),
    status TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_by TEXT
);

CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES (Assuming authenticated users have full access for a simple single-business multi-user dashboard,
-- or we can allow public access for demonstration/local testing, but we define secure policies for production)

-- For easy initial deployment/demo, we can allow full access to authenticated users:
CREATE POLICY "Allow authenticated users full access to places" 
ON places FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to bills" 
ON bills FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to activity_logs" 
ON activity_logs FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- (Optional) If developer wants to test without auth during setup, they can create public policies or disable RLS temporary.
-- In our API routes we will use Supabase Service Role client or authenticated client.

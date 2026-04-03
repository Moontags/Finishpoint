-- ============================================================
-- Finishpoint — Admin Panel Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PRICES TABLE (dynamic pricing for the calculator)
-- ============================================================
CREATE TABLE IF NOT EXISTS prices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       numeric(8,2) NOT NULL,
  label       text,
  updated_at  timestamptz DEFAULT now()
);

-- Default values (skip if already exists)
INSERT INTO prices (key, value, label) VALUES
  ('base_kappaletavara', 89.00,  'Kappaletavara 0–40 km'),
  ('base_muutto',        269.00, 'Muutto 0–40 km'),
  ('base_kierratys',     54.99,  'Kierrätys 0–40 km'),
  ('base_ajoneuvo_40',   129.00, 'Ajoneuvo 0–40 km'),
  ('base_ajoneuvo_80',   169.00, 'Ajoneuvo 41–80 km'),
  ('km_rate_tavara',     1.29,   'Lisäkilometri tavara'),
  ('km_rate_muutto',     0.69,   'Lisäkilometri muutto'),
  ('km_rate_ajoneuvo',   1.29,   'Lisäkilometri ajoneuvo'),
  ('floor_extra',        5.00,   'Kerroslisä/kerros'),
  ('vat_rate',           0.255,  'ALV-kerroin')
ON CONFLICT (key) DO NOTHING;

-- 2. BLOCKED_DATES TABLE (calendar day locking)
-- ============================================================
CREATE TABLE IF NOT EXISTS blocked_dates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date UNIQUE NOT NULL,
  reason       text,
  created_at   timestamptz DEFAULT now()
);

-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE prices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read/write prices and blocked_dates
-- (The admin panel uses service_role key which bypasses RLS entirely,
--  but these policies protect against direct API access with anon key)
DROP POLICY IF EXISTS "admin_all" ON prices;
CREATE POLICY "admin_all" ON prices
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "admin_all" ON blocked_dates;
CREATE POLICY "admin_all" ON blocked_dates
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public (anon) read access to blocked_dates for the calendar widget
-- (so the booking calendar can check which dates are unavailable)
DROP POLICY IF EXISTS "public_read" ON blocked_dates;
CREATE POLICY "public_read" ON blocked_dates
  FOR SELECT USING (true);

-- ============================================================
-- DONE — You can now use /admin to manage prices and dates
-- ============================================================

-- ============================================================
-- Finishpoint — täydellinen tietokantamigraatio
-- Aja Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Pakota schema cache reload
NOTIFY pgrst, 'reload schema';

-- 2. varaukset-taulu
-- ============================================================
CREATE TABLE IF NOT EXISTS public.varaukset (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at                timestamptz NOT NULL DEFAULT timezone('utc', now()),
  asiakas_nimi              text,
  asiakas_email             text NOT NULL,
  asiakas_puhelin           text,
  palvelutyyppi             text NOT NULL,
  lahto_osoite              text NOT NULL,
  kohde_osoite              text NOT NULL,
  varaus_pvm                date NOT NULL,
  aloitusaika               time NOT NULL,
  lopetusaika               time NOT NULL,
  ajoaika_kohteeseen_min    integer,
  ajoaika_riihimaelta_min   integer,
  hinta_alv                 numeric(10,2),
  hinta_alv0                numeric(10,2),
  status                    text NOT NULL DEFAULT 'vahvistettu'
);

CREATE INDEX IF NOT EXISTS varaukset_pvm_idx    ON public.varaukset (varaus_pvm);
CREATE INDEX IF NOT EXISTS varaukset_status_idx ON public.varaukset (status);

ALTER TABLE public.varaukset ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.varaukset;
CREATE POLICY "service_role_all" ON public.varaukset
  FOR ALL USING (true);

-- 3. prices-taulu
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      numeric(8,2) NOT NULL,
  label      text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read" ON public.prices;
CREATE POLICY "anon_read" ON public.prices
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "authenticated_write" ON public.prices;
CREATE POLICY "authenticated_write" ON public.prices
  FOR ALL TO authenticated USING (true);

-- Lisää oletushinnat (ohita jos jo olemassa)
INSERT INTO public.prices (key, value, label) VALUES
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

-- 4. blocked_dates-taulu
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date UNIQUE NOT NULL,
  reason       text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read" ON public.blocked_dates;
CREATE POLICY "anon_read" ON public.blocked_dates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "authenticated_write" ON public.blocked_dates;
CREATE POLICY "authenticated_write" ON public.blocked_dates
  FOR ALL TO authenticated USING (true);

-- 5. Vahvista taulut
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('varaukset', 'prices', 'blocked_dates')
ORDER BY table_name;

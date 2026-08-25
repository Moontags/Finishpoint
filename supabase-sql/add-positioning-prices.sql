-- ============================================================
-- POSITIOINTIMAKSU (tyhjänä ajo) — Pikakuljetus / kappaletavara
-- ============================================================
-- Positiointimaksu laskutetaan erikseen etäisyyksille
-- tukikohta→noutopaikka ja jättöpaikka→tukikohta. Laskenta on
-- progressiivinen: jokainen porras laskuttaa vain omalle välilleen
-- osuvat kilometrit. Ensimmäiset 40 km ovat maksuttomia, koska ne
-- sisältyvät jo base_kappaletavara-perustaksaan.
--
-- Porrasrajat (40/80/200/400/600 km) ovat koodissa kiinteitä
-- (src/lib/pricing.ts: positioningTiers), vain €/km-hinnat luetaan
-- täältä. Jos rivi puuttuu, koodi käyttää defaultPriceConfigin arvoa.
--
-- Arvot ovat €/km SIS. ALV, kuten muutkin prices-taulun hinnat.
-- ============================================================

INSERT INTO prices (key, value, label) VALUES
  ('positioning_rate_40_80',   0.50, 'Positiointi 40–80 km (€/km)'),
  ('positioning_rate_80_200',  0.40, 'Positiointi 80–200 km (€/km)'),
  ('positioning_rate_200_400', 0.30, 'Positiointi 200–400 km (€/km)'),
  ('positioning_rate_400_600', 0.20, 'Positiointi 400–600 km (€/km)'),
  ('positioning_rate_600_plus', 0.15, 'Positiointi yli 600 km (€/km)')
ON CONFLICT (key) DO NOTHING;

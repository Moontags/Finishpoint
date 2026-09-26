-- Pikakuljetuksen verollinen perustaksa, 0–40 km.
UPDATE public.prices
SET value = 99.00, updated_at = now()
WHERE key = 'base_kappaletavara';

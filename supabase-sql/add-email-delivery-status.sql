-- Migraatio: sähköpostin toimitustilan seuranta (bounce-käsittely)
-- Aja tämä Supabasen SQL-editorissa olemassa olevaan tietokantaan.
-- Idempotentti: voidaan ajaa turvallisesti useita kertoja.

-- Pakota schema cache reload
NOTIFY pgrst, 'reload schema';

-- 1. orders-taulu: kuitin/vahvistuksen lähetystila + mahdollinen virheviesti
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS email_delivery_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS email_delivery_error text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_email_delivery_status_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_email_delivery_status_check
      CHECK (email_delivery_status IN ('pending', 'sent', 'failed'));
  END IF;
END $$;

-- 2. varaukset-taulu: sama tila, jotta admin-näkymä (KeikkaView) voi näyttää
--    varoituksen epäonnistuneesta lähetyksestä.
ALTER TABLE public.varaukset
  ADD COLUMN IF NOT EXISTS email_delivery_status text;

NOTIFY pgrst, 'reload schema';

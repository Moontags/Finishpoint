# Finishpoint

Single-page website for Finishpoint, a logistics company focused on motorcycle transport, moving services, and custom freight jobs.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Lucide React icons

## Features

- Dark single-page landing page with electric blue accents
- Sticky header with quick call action
- Service cards with highlighted motorcycle transport offering
- Interactive motorcycle transport calculator using VAT 0% pricing rules
- Address autocomplete (Google Places) for piece goods transport addresses
- Address-based distance lookup (Google Maps) with optional A-B-C multi-stop routing
- Quote request form with backend API submission
- Responsive layout optimized for mobile and desktop

## Backend quote submission setup

The quote form posts to the API route `/api/quote`, which sends email via SMTP.
The distance lookup posts to `/api/distance`, which fetches route distance from Google Maps Distance Matrix API.
Address suggestions are fetched from `/api/places/autocomplete` using Google Places Autocomplete API.

1. Create `.env.local` from `.env.example`.
2. Fill in SMTP credentials.
3. Set `QUOTE_RECIPIENT` if quotes should go somewhere else than `kuljetus@finishpoint.fi`.
4. Add the same variables to your hosting provider's server-side environment settings before deploying.

Note: `SMTP_SECURE` must be the string `true` or `false` in the env file. The API route parses it with `process.env.SMTP_SECURE === "true"` so the value is converted to a real boolean before creating the Nodemailer transport.

Required variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `QUOTE_RECIPIENT` (optional)
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK` (optional fallback)
- `MOBILEPAY_CLIENT_ID` (optional, enables API mode)
- `MOBILEPAY_CLIENT_SECRET` (optional, enables API mode)
- `MOBILEPAY_SUBSCRIPTION_KEY_PRIMARY` (optional, enables API mode)

## MobilePay setup

The order API supports two payment modes:

1. **API mode (recommended):** If `MOBILEPAY_CLIENT_ID`, `MOBILEPAY_CLIENT_SECRET`, and a subscription key are set, the server creates a MobilePay payment dynamically.
2. **Fallback link mode:** If API mode is not configured, the server uses `NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK`.
3. **Vipps eCom mode:** If `VIPPS_CLIENT_ID`, `VIPPS_CLIENT_SECRET`, `VIPPS_SUBSCRIPTION_KEY_PRIMARY` (or `VIPPS_SUBSCRIPTION_KEY`), and `VIPPS_MERCHANT_SERIAL_NUMBER` are set, the server uses Vipps APIs for token and payment creation.

Required for API mode (server-only variables):

- `MOBILEPAY_CLIENT_ID`
- `MOBILEPAY_CLIENT_SECRET`
- `MOBILEPAY_SUBSCRIPTION_KEY_PRIMARY` (or `MOBILEPAY_SUBSCRIPTION_KEY`)

Optional API overrides:

- `MOBILEPAY_SUBSCRIPTION_KEY_SECONDARY`
- `MOBILEPAY_SCOPE`
- `MOBILEPAY_TOKEN_URL`
- `MOBILEPAY_PAYMENTS_URL`
- `MOBILEPAY_CURRENCY` (default `EUR`)
- `MOBILEPAY_RETURN_URL`
- `MOBILEPAY_CANCEL_URL`
- `MOBILEPAY_WEBHOOK_URL`
- `NEXT_PUBLIC_SITE_URL` (used as fallback return URL)

Optional Vipps eCom overrides:

- `VIPPS_SUBSCRIPTION_KEY_SECONDARY`
- `VIPPS_SUBSCRIPTION_KEY`
- `VIPPS_TOKEN_URL` (default `https://api.vipps.no/accessToken/get`)
- `VIPPS_PAYMENTS_URL` (default `https://api.vipps.no/ecomm/v2/payments`)
- `VIPPS_CURRENCY` (default `NOK`)
- `VIPPS_RETURN_URL`
- `VIPPS_CANCEL_URL`
- `VIPPS_CALLBACK_PREFIX`

Security note: keep all `MOBILEPAY_*` secrets server-side only, never with `NEXT_PUBLIC_`.

If you enable both MobilePay and Vipps credentials at the same time, Vipps mode is prioritized.

For Google Maps features to work in production, the API key must be available as a server-side environment variable and the following Google APIs must be enabled for the same project:

- Distance Matrix API
- Places API

If `GOOGLE_MAPS_API_KEY` is missing in production, address autocomplete falls back to manual typing and route-based pricing lookup is unavailable until the environment variable is added and the app is redeployed.

## Pricing logic

- 0–40 km: 120 €
- 40–80 km: 180 €
- Over 80 km: 1.40 € / km
- Multi-stop route: 1.40 € / km based on the total route length
- VAT notice: add ALV 25.5% to totals

## Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run start` starts the production server
- `npm run lint` runs ESLint

## Contact

- Company: Finishpoint
- Owner: Mediasata
- Phone: 050 354 7763
- Email: kuljetus@finishpoint.fi

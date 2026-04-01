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

1. Create a local env file from `.env.example`.
2. Fill in SMTP credentials.
3. Set `QUOTE_RECIPIENT` if quotes should go somewhere else than `kuljetus@finishpoint.fi`.

Required variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `QUOTE_RECIPIENT` (optional)
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_MOBILEPAY_PAYMENT_LINK` (optional)

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

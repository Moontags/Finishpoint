# Deployment Checklist — Pakuvie

Tarkistuslista tuotantoon siirtymistä varten.

---

## ☑️ **VALMISTELUT (lokaali ympäristö)**

### 1. Tarkista Build
```bash
npm run build
```
- ✅ Build menee läpi ilman virheitä
- ✅ Ei kriittisiä TypeScript-virheitä
- ✅ Ei puuttuvia riippuvuuksia

### 2. Testaa Lokaali Tuotantoversio
```bash
npm run build && npm start
```
- [ ] Etusivu latautuu oikein
- [ ] Tilauslomake toimii
- [ ] Admin-kirjautuminen toimii
- [ ] Varausten hallinta toimii

### 3. Tarkista Ympäristömuuttujat
Katso `.env.local` ja varmista että kaikki arvot ovat oikein:
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.pakuvie.fi`
- [ ] SMTP-asetukset (sähköpostit)
- [ ] Supabase-avaimet
- [ ] Google Maps API -avain
- [ ] Vipps/MobilePay API -avaimet

---

## 🚀 **VERCEL/HOSTAUS**

### 1. Ympäristömuuttujat Vercelissä
Lisää kaikki `.env.local`-muuttujat Vercelin dashboardiin:

**Production Environment Variables:**
```
NEXT_PUBLIC_SITE_URL=https://www.pakuvie.fi
NEXT_PUBLIC_SUPABASE_URL=https://sjrtejcihqplxjickbue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<kopioi .env.local:sta>
SUPABASE_SERVICE_ROLE_KEY=<kopioi .env.local:sta>
GOOGLE_MAPS_API_KEY=<kopioi .env.local:sta>

# SMTP
SMTP_HOST=posti.zoner.fi
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=kuljetus@pakuvie.fi
SMTP_PASS=<kopioi .env.local:sta>
SMTP_FROM=kuljetus@pakuvie.fi
QUOTE_RECIPIENT=kuljetus@pakuvie.fi

# Vipps/MobilePay
VIPPS_CLIENT_ID=<kopioi .env.local:sta>
VIPPS_CLIENT_SECRET=<kopioi .env.local:sta>
VIPPS_SUBSCRIPTION_KEY_PRIMARY=<kopioi .env.local:sta>
VIPPS_MERCHANT_SERIAL_NUMBER=2090122
VIPPS_PAYMENTS_URL=https://api.vipps.no/epayment/v1/payments
VIPPS_TOKEN_URL=https://api.vipps.no/accessToken/get
VIPPS_CURRENCY=EUR
VIPPS_RETURN_URL=https://www.pakuvie.fi/kassa?success=1
VIPPS_CANCEL_URL=https://www.pakuvie.fi/kassa?cancel=1
VIPPS_CALLBACK_PREFIX=https://www.pakuvie.fi/api/vipps
MOBILEPAY_MERCHANT_ID=2090122
MOBILEPAY_CURRENCY=EUR
```

### 2. Domain-asetukset
- [ ] `www.pakuvie.fi` osoittaa Verceliin
- [ ] SSL-sertifikaatti aktiivinen (Vercel hoitaa automaattisesti)
- [ ] Redirect `pakuvie.fi` → `www.pakuvie.fi`

### 3. Deploy
```bash
git add .
git commit -m "Production ready: Bug fixes, mobile UX, SEO improvements"
git push origin main
```

Vercel deployaa automaattisesti kun pushaat `main`-branchiin.

---

## ✅ **TUOTANNON JÄLKEEN**

### 1. Smoke Tests
- [ ] Käy osoitteessa https://www.pakuvie.fi/
- [ ] Testaa tilauslomake (älä lähetä oikeaa tilausta)
- [ ] Testaa admin-kirjautuminen: https://www.pakuvie.fi/admin/login
- [ ] Tarkista että sähköpostit lähtevät (testaa tarjouspyyntö)

### 2. Vipps/MobilePay -testaus
- [ ] Tee testivaraus laskurilla
- [ ] Varmista että maksulinkki toimii
- [ ] Testaa "Peruuta maksu" -toiminto
- [ ] Testaa onnistunut maksu (käytä test-ympäristöä jos mahdollista)

### 3. SEO & Lighthouse
```bash
# Käytä Chrome DevTools > Lighthouse
# Tai: https://pagespeed.web.dev/
```
Tavoitearvot:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### 4. Mobiilitestaus
Testaa eri laitteilla:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad Safari
- [ ] Varmista että "Tilaa heti" -nappi näkyy heti hero-osiossa

### 5. Monitorointi
- [ ] Seuraa Vercelin error-logeja ensimmäiset 24h
- [ ] Tarkista Supabasen kyselylogit (admin-dashboard)
- [ ] Testaa että sähköposti-ilmoitukset tulevat perille

---

## 🔧 **OPTIMOINNIT (post-launch)**

### 1. Kuvaoptimointi
Katso ohjeet: `docs/IMAGE_OPTIMIZATION.md`

### 2. Analytics (valinnainen)
Lisää Google Analytics tai Plausible seurantaa varten:
```typescript
// src/app/layout.tsx
<Script src="..." strategy="afterInteractive" />
```

### 3. Sentry (valinnainen)
Error tracking tuotannossa:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 📞 **TUKI**

### Ongelmatilanteet
1. **Build epäonnistuu Vercelissä:**
   - Tarkista Vercel build logs
   - Varmista että kaikki env-muuttujat on määritelty
   - Kokeile `npm run build` lokaalisti

2. **Maksu ei toimi:**
   - Tarkista Vipps API -avaimet
   - Varmista että webhook-URL on oikein
   - Katso Vercel function logs

3. **Admin-kirjautuminen ei toimi:**
   - Varmista että Supabase auth redirectit ovat oikein
   - Lisää admin-email Supabase Auth > Users
   - Tarkista että `NEXT_PUBLIC_SITE_URL` on oikea

4. **Sähköpostit eivät lähde:**
   - Tarkista SMTP-asetukset Vercelissä
   - Testaa yhteys: `telnet posti.zoner.fi 465`
   - Varmista että salasana on oikein

---

## ✨ **VALMISTA!**

Kun kaikki kohdat on tarkistettu, sovellus on valmis tuotantoon. 🎉

**Muista:**
- Älä ikinä commitoi `.env.local` -tiedostoa Gitiin
- Ota backupit Supabase-tietokannasta säännöllisesti
- Seuraa Vercel-logeja ensimmäiset päivät

---

**Päivitetty:** 2026-04-04
**Versio:** 1.0

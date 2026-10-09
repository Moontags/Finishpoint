# SEO-korjaukset ja tarkistus

Laskuri sijaitsee etusivun `/#calculator`-ankkurissa (pikakuljetus ja muutto). `/laskuri` ohjautuu pysyvästi HTTP 308:lla siihen. Myös vanhat `/laskuri/kappaletavara`-viittaukset Playwright-testeissä päivitettiin.

Pääosoite on `https://www.pakuvie.fi`, kuten aiemmissa canonical-osoitteissa ja metadataBase-arvossa. `src/lib/site.ts` sisältää yhteisen SITE_URL-vakion.

Sivukartta generoi palvelut services-datasta ja paikkakunnat yhteisestä areas-datasta, jota myös aluelistaus ja navigaatio käyttävät. Laskuri ja yleinen tarjouslomake ovat etusivulla; erillistä yhteystietosivua ei ole. Maksu-/paluusivu /kassa sekä admin ja API on rajattu pois. Kassalle lisättiin noindex.

GSC-vahvistus luetaan NEXT_PUBLIC_GSC_VERIFICATION-muuttujasta. Arvoa ei keksitty tai asetettu; paikallinen HTML ei sisällä vahvistusmetatunnistetta. Muuttuja on dokumentoitu .env.example-tiedostossa.

## Tarkistukset

- Lopullinen npm run build valmistui ilman virheitä (myös lint ja TypeScript).
- npm run start sekä curl /robots.txt ja /sitemap.xml onnistuvat.
- Kaikki 17 sivukartan URLia ovat absoluuttisia www-domainilla, ja niiden polut vastaavat paikallisessa tuotantobuildissa HTTP 200. Julkaistua tuotantosivustoa ei muutettu tai testattu.
- Kaikki 22 julkisilta sivuilta löytynyttä sisäistä linkkiä ja niiden ankkurikohteet tarkistettu. PDF vastaa 200.
- Lähdekoodin sisäisten href-polkujen reittivastaavuus tarkistettu; admin-polut vastaavat sivuja tai signout-routea (autentikoituja sivuja ei HTTP-testattu kirjautuneena).
- Muita 404-linkkejä ei löytynyt. Palvelusivujen viisi puuttuvaa #quote-kohdetta korjattiin navigaation kautta etusivun tarjouslomakkeeseen.
- public/ ei sisällä robots.txt- tai sitemap.xml-tiedostoa. Middleware/proxy ei estä tai ohjaa SEO-reittejä: matcherit koskevat vain adminia tai ovat tyhjiä.

## Sisäiset href-polut

- `/`
- `/#calculator`
- `/#quote`
- `/#services`
- `/admin`
- `/admin/auth/signout`
- `/admin/customers`
- `/admin/dates`
- `/admin/prices`
- `/admin/stats`
- `/alueet`
- `/alueet/hameenlinna`
- `/alueet/helsinki`
- `/alueet/hyvinkaa`
- `/alueet/jarvenpaa`
- `/alueet/riihimaki`
- `/alueet/tuusula`
- `/alueet/vantaa`
- `/apuvalinekuljetus`
- `/images/sopimusehdot.pdf`
- `/kassa`
- `/kierratys`
- `/kierratys#quote`
- `/muutot`
- `/pesukone-kuljetus`
- `/sangyn-kuljetus`
- `/sohvan-kuljetus`
- `/tilaa`
- `/yritysasiakkaat`
- `/yritysasiakkaat#quote`

## Muutetut tiedostot

- `.env.example`
- `SEO_CHECKS.md`
- `next.config.js`
- `src/app/admin/auth/signout/route.ts`
- `src/app/alueet/AluePageClient.tsx`
- `src/app/alueet/hameenlinna/page.tsx`
- `src/app/alueet/helsinki/page.tsx`
- `src/app/alueet/hyvinkaa/page.tsx`
- `src/app/alueet/jarvenpaa/page.tsx`
- `src/app/alueet/page.tsx`
- `src/app/alueet/riihimaki/page.tsx`
- `src/app/alueet/tuusula/page.tsx`
- `src/app/alueet/vantaa/page.tsx`
- `src/app/apuvalinekuljetus/page.tsx`
- `src/app/kassa/layout.tsx`
- `src/app/layout.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/yritysasiakkaat/page.tsx`
- `src/components/site-header.tsx`
- `src/lib/areas.ts`
- `src/lib/email-templates.ts`
- `src/lib/site.ts`
- `tests/booking-accessibility.spec.ts`
- `tests/calculator.spec.ts`

# Hyttihuolto

Itsenäinen suomenkielinen Next.js-sivusto liikkuvalle työkoneiden hyttien puhdistuspalvelulle. Tämä kansio ei käytä Pakuvien asetuksia, asiakastietoja tai ympäristömuuttujia.

## Kehitys

Node.js 24 LTS on suositeltu.

```sh
cd www
npm install
npm run dev
```

Tarkistukset: `npm run typecheck` ja `npm run build`.

## Ennen julkaisua

- Vahvista Hyttihuolto-nimi ja oikeus sen käyttöön sekä verkkotunnus.
- Vahvista hinnat, arvonlisäveron esitystapa, matkakulut ja toiminta-alue.
- Lisää yrityksen nimi, Y-tunnus, puhelin ja sähköposti.
- Ota lomakkeen sähköpostipalvelu käyttöön. Lomake on tarkoituksella pois käytöstä eikä tallenna tai lähetä tietoja. Vercel Marketplace -hausta löytyi Resend email (`resend/resend-email`). Palvelua ei ole provisionoitu: oma Vercel-projekti, vastaanottaja ja lähettäjäverkkotunnus on vahvistettava ensin.
- Lisää henkilötietojen käsittelyn kuvaus valitun lomakepalvelun mukaan.
- Vaihda kuvituskuvat omiin työ- ja kalustokuviin. Kuvitusta ei esitetä yrityksen omana kalustona.
- Poista luonnosbanneri ja päivitä robots-asetus hakukonenäkyvyyttä varten; lisää vahvistettu verkkotunnus metatietoihin ja sivukarttaan.

## Vercel

Luo oma Vercel-projekti ja valitse Root Directoryksi `www`, Framework Presetiksi Next.js ja Node.js-versioksi 24.x. Tavalliset build- ja install-asetukset riittävät. Projektia ei ole julkaistu.

Vercel CLI oli ympäristössä versiossa 62.2.0. Päivitä ennen käyttöönottoa: `npm i -g vercel@latest`.

## Kuvat

Unsplash-kuvituskuvat (ei kuvia yrityksen kalustosta):
- `/public/images/excavator.jpg`: https://images.unsplash.com/photo-1580901368919-7738efb0f87e
- `/public/images/tractor.jpg`: https://images.unsplash.com/photo-1530267981375-f0de937f5f13

Kuvat säilytetään paikallisesti ja tarjoillaan Next.js:n kuvaoptimoinnin kautta. Muut resurssit ovat paikallisia; ei ulkoisia fontteja, analytiikkaa tai evästetyökaluja.

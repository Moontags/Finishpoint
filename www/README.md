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

Julkaistu: https://hyttihuolto.vercel.app

Vercel-projekti: `hyttihuolto`, tili: `jaris-projects-ed391ebc`. GitHub: `Moontags/Finishpoint`, tuotantohaara: `main`. Root Directory: `www`, Framework: Next.js, Node.js: 24.x. GitHubin main-haaraan lähetetyt muutokset julkaistaan automaattisesti.

Suosi Git-julkaisuja. Vercelin rootDirectory-asetus on suhteessa koko repositorioon; älä julkaise pelkkää www-kansiota komentoriviltä tämän asetuksen kanssa.

Julkaisu tehtiin Vercel CLI 65.1.0:lla (`npx --yes vercel@latest`). Globaalin 62.2.0-version voi päivittää: `npm i -g vercel@latest`.

## Kuvat

Unsplash-kuvituskuvat (ei kuvia yrityksen kalustosta):
- `/public/images/excavator.jpg`: https://images.unsplash.com/photo-1580901368919-7738efb0f87e
- `/public/images/tractor.jpg`: https://images.unsplash.com/photo-1530267981375-f0de937f5f13

Kuvat säilytetään paikallisesti ja tarjoillaan Next.js:n kuvaoptimoinnin kautta. Otsikoissa Barlow Condensed ja leipätekstissä Inter (`next/font/google`): fontit ladataan rakennusvaiheessa ja tarjoillaan sivuston omista tiedostoista. Vierailijan selain ei ota yhteyttä Google Fontsiin. Ei analytiikkaa tai evästetyökaluja.

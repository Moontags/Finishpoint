# Kuvaoptimointiohjeet

## Tilan analyysi
Suuret PNG-kuvat: `paku1.png` (4.3 MB), `paku2.png` (4.5 MB), `paku3.png` (5.4 MB), `paku5.png` (4.0 MB)

## Automaattinen optimointi (JO KÄYTÖSSÄ)
Next.js Image -komponentti (`next/image`) optimoi kuvat automaattisesti:
- Lazy loading
- Responsiiviset koot
- Moderni formaatti (WebP/AVIF) tukeville selaimille
- Automaattinen cachetus

## Manuaalinen optimointi (SUOSITELTU)

### Vaihtoehto 1: Online-työkalut
1. Käytä https://squoosh.app/
2. Lataa `paku*.png` -tiedostot
3. Valitse WebP, laatu 85%
4. Tallenna ja korvaa alkuperäiset

### Vaihtoehto 2: Komentoriviltä (cwebp)
```bash
# Asenna Homebrew (jos ei ole vielä)
brew install webp

# Konvertoi kaikki pakukuvat
cd public/images
for file in paku*.png finishpoint-logo.png; do
  cwebp -q 85 -m 6 "$file" -o "${file%.png}.webp"
done
```

### Vaihtoehto 3: ImageMagick
```bash
brew install imagemagick
for file in paku*.png; do
  magick "$file" -quality 85 "${file%.png}.webp"
done
```

## Odotettava tulos
- paku1.png: 4.3 MB → ~600 KB (WebP)
- paku2.png: 4.5 MB → ~650 KB
- paku3.png: 5.4 MB → ~800 KB
- paku5.png: 4.0 MB → ~550 KB

**Yhteensä säästö: ~15 MB → ~2.5 MB**

## Päivitä koodia (jos käytät WebP)

Ei tarvitse muuttaa mitään! Next.js Image hoitaa automaattisesti:
```tsx
<Image src="/images/paku2.png" alt="" fill />
```

Next.js tarjoilee WebP-version automaattisesti tukeville selaimille.

## Huomautus
Tällä hetkellä käytät jo `next/image` komponenttia kaikkialla, joten optimointi toimii jo automaattisesti runtime!
Manuaalinen konvertointi vähentää vain alkuperäisten tiedostojen kokoa.

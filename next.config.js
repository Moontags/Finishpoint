/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'finishpoint.fi' }],
        destination: 'https://pakuvie.fi/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.finishpoint.fi' }],
        destination: 'https://pakuvie.fi/:path*',
        permanent: true,
      },
      // Moottoripyöräkuljetukset hoitaa MP-Logistiikka. Vanha oma sivu ohjataan
      // sinne, jotta kertynyt hakukonearvo ja ulkoiset linkit eivät katoa.
      {
        source: '/pyorakuljetus',
        destination: 'https://mp-logistiikka.fi',
        // 301 eikä permanent: true (308), koska vanhat hakukoneindeksoinnit ja
        // ulkoiset linkit odottavat nimenomaan 301:tä.
        statusCode: 301,
      },
      // Mönkijä- ja venekuljetus poistuivat tarjonnasta — vanhat osoitteet
      // ohjataan etusivulle 404:n sijaan.
      {
        source: '/monkijakuljetus',
        destination: '/',
        statusCode: 301,
      },
      {
        source: '/veneen-kuljetus',
        destination: '/',
        statusCode: 301,
      },
    ];
  },
};

module.exports = nextConfig;

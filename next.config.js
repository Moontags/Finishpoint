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
    ];
  },
};

module.exports = nextConfig;

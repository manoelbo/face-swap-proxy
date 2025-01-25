/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'manebrasil123-face-swap-mgt.hf.space',
        port: '',
        pathname: '/file/**',
      },
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

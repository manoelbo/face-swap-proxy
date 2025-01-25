// import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: WebpackConfig) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        path: false,
        stream: false,
        zlib: false,
        os: false,
        buffer: false,
      }
    };
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

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
    unoptimized: true
  },

  output: 'standalone',
  
  poweredByHeader: false,
  
  compress: true,
  
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?!localhost).*',
          },
        ],
        permanent: true,
        destination: 'https://:path*',
      },
    ]
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      timeout: 120
    }
  },

  functions: {
    'api/*': {
      maxDuration: 120
    }
  }
};

module.exports = nextConfig;

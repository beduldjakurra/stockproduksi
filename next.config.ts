import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // PWA Support
  async rewrites() {
    return [
      {
        source: '/app',
        destination: '/index.html',
      },
    ];
  },
  // Static file handling
  async headers() {
    return [
      {
        source: '/index.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    // Only modify webpack config in development if needed
    if (dev) {
      // Don't ignore all files - this causes chunk loading issues
      // Instead, let's configure proper watch options
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/files/:path*",
        destination: "http://localhost:8080/files/:path*",
      },
      {
        source: "/dich-vu",
        destination: "/services",
      },
      {
        source: "/dich-vu/:slug",
        destination: "/services/:slug",
      },
    ];
  },
};

export default withNextIntl(nextConfig);

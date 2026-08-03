import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;

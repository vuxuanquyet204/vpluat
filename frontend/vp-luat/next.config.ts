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
    ];
  },
};

export default nextConfig;

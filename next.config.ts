import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Turbopack is enabled by default in Next.js 16 */
  turbopack: {},

  /* Experimental features for better performance */
  experimental: {
    optimizePackageImports: ['@/lib', '@/components'],
  },
};

export default nextConfig;

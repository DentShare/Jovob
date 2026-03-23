import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ioredis', '@prisma/client'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.railway.app' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', '@trpc/client'],
  },
};

export default nextConfig;

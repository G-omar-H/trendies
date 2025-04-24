import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production build (optional)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

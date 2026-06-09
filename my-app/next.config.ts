import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   output: 'standalone', // Important for Vercel
  trailingSlash: false,
};

export default nextConfig;
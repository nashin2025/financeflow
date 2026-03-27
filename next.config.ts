import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    unoptimized: true,
  },
  
  trailingSlash: true,
  
  compress: true,
  
  poweredByHeader: false,
  
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
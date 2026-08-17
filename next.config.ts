import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize image delivery — auto-convert to AVIF/WebP
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
  },

  // Compress responses with Gzip/Brotli
  compress: true,

  experimental: {
    // Inline and optimize critical CSS — removes the render-blocking CSS chunk
    optimizeCss: true,
  },
};

export default nextConfig;

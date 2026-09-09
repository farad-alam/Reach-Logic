import type { NextConfig } from "next";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https: data:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://tawk.to wss://tawk.to https://*.tawk.to wss://*.tawk.to",
  "worker-src 'self' blob:",
  "frame-src https://tawk.to https://*.tawk.to",
  "upgrade-insecure-requests",
].join("; ");

const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "accelerometer=()",
  "gyroscope=()",
  "magnetometer=()",
].join(", ");

const nextConfig: NextConfig = {
  // Optimize image delivery — auto-convert to AVIF/WebP
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
  },

  // Compress responses with Gzip/Brotli
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
        ],
      },
    ];
  },

  experimental: {
    // Inline and optimize critical CSS — removes the render-blocking CSS chunk
    optimizeCss: true,
  },
};

export default nextConfig;

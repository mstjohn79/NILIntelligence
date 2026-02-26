import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force dynamic rendering for all pages (fixes Next.js 16 prerender issue)
  experimental: {
    // Disable static generation for pages using client hooks
  },
};

export default nextConfig;

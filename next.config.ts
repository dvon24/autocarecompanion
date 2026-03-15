import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Caching strategies will be expanded in Epic 2 (Offline-First Garage Mode)
  // See: architecture.md#Service Worker Strategy
});

const nextConfig: NextConfig = {
  // Next.js 16 requires explicit turbopack config when webpack plugins are used
  // @ducanh2912/next-pwa uses webpack, so we need to build with webpack
  // Empty turbopack config silences the warning but still uses webpack for PWA
  turbopack: {},

  // Enable View Transitions API for smooth page transitions
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition
  experimental: {
    viewTransition: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withPWA(nextConfig);

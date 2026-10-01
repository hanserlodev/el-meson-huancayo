import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hosting estático en Firebase (sin Cloud Functions para optimización).
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "firebasestorage.googleapis.com" }, { protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;

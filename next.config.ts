import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.29.172", "*.ngrok-free.app", "*.ngrok-free.dev"],
};

export default nextConfig;

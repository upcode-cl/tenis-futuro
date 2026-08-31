import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MongoDB + bson: no bundlear con Turbopack; usar require nativo en Lambda
  serverExternalPackages: ["mongodb", "bson", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;

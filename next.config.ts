import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ippiego.supabase.co",
        pathname: "/storage/v1/object/public/products/**",
      },
      {
        protocol: "https",
        hostname: "static.toss.im",
        pathname: "/lotties/**",
      },
    ],
    formats: ["image/avif", "image/webp"], // ✅ WebP/AVIF 변환 활성화!
  },
};

export default nextConfig;

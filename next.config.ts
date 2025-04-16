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
        pathname: "/lotties/**", // Toss 애니메이션 이미지 경로
      },
    ],
  },
};

export default nextConfig;

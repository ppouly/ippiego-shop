// src/app/layout.tsx


import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ThemeInit from "@/components/ThemeInit"; // 👈 다크모드 감지용 클라이언트 컴포넌트

export const metadata = {
  title: "입히고 | 환불보장, 수입 유아동복 중고 마켓 IPPIE Go!",
  description: "보보쇼즈, 미니로디니 등 수입 유아동복 중고 마켓 입히고는 환불가능하니까, 먼저 입혀보세요! 멋은 그대로, 부담은 덜게, 입히고!",
  keywords: [
   '보보쇼즈 중고', '미니로디니 중고','던스 순무','보보쇼즈 딸기','아폴리나 중고','루이스미샤 중고','타오 중고', '중고 아동복', '수입 아동복',"입히고",
  ],
  authors: [{ name: "IPPIEGO", url: "https://ippiego.shop" }],
  creator: "입히고",
  metadataBase: new URL("https://ippiego.shop"),
  openGraph: {
    title: "입히고 | 환불보장, 수입 유아동복 중고 마켓 IPPIE Go!",
    description: "보보쇼즈, 미니로디니 등 수입 유아동복 중고 마켓 입히고는 환불가능하니까, 먼저 입혀보세요! 멋은 그대로, 부담은 덜게, 입히고!",
    url: "https://ippiego.shop",
    siteName: "입히고",
    images: [
      {
        url:  "https://ippiego.shop/og-image.jpg",
        width: 800,
        height: 600,
        alt: "입히고 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "입히고 | 환불보장, 수입 유아동복 중고 마켓 IPPIE Go!",
    description: "보보쇼즈, 미니로디니 등 수입 유아동복 중고 마켓 입히고는 환불가능하니까, 먼저 입혀보세요! 멋은 그대로, 부담은 덜게, 입히고!",
    images: ["/og-image.jpg"],
  },
  // 여기 ↓ HTML 메타 태그 직접 삽입
  other: {
    'naver-site-verification': '77e806aef27f37e2db1492c696b6c355a9674d99',
  },  
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 👉 이 부분 추가! */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>      
      <body className="bg-background text-text dark:bg-background-dark dark:text-text-dark pt-14 pb-14">
        <ThemeInit /> {/* ✅ 다크모드 감지 로직 */}
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}



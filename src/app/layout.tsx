// src/app/layout.tsx


import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ThemeInit from "@/components/ThemeInit"; // 👈 다크모드 감지용 클라이언트 컴포넌트

export const metadata = {
  title: "입히고 IPPIEGO | 중고 수입 유아동복 리세일 마켓",
  description: "멋은 그대로, 부담은 덜게. 프리미엄 중고 아동복을 입히고에서 만나보세요. IPPIE GO!",
  keywords: [
    "입히고","키즈 패션", "빈티지 아동복", "수입 아동의류", "보보쇼즈", "보보쇼즈 딸기", "미니로디니", "루이스미샤", "아폴리니", "타오","던스", "던스 순무", "수입 아동복", "IPPiEGO", "ippiego.shop",
  ],
  authors: [{ name: "IPPIEGO", url: "https://ippiego.shop" }],
  creator: "IPPIEGO",
  metadataBase: new URL("https://ippiego.shop"),
  openGraph: {
    title: "IPPIEGO | 중고 수입 유아동복 리세일샵",
    description: "중고 수입 유아동복 리세일 마켓, 자유롭고 감성적인 아이들을 위한 입히고!",
    url: "https://ippiego.shop",
    siteName: "IPPIEGO",
    images: [
      {
        url: "/og-image.jpg",
        width: 800,
        height: 600,
        alt: "IPPIEGO 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "입히고 | 환불보장 엄선된 중고 수입 유아동복 리세일샵",
    description: "자유롭고 감성적인 아이들을 위한 빈티지 유아동복 리세일샵",
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
      <body className="bg-background text-text dark:bg-background-dark dark:text-text-dark pt-14 pb-14">
        <ThemeInit /> {/* ✅ 다크모드 감지 로직 */}
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}


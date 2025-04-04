// src/app/layout.tsx

import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "IPPIEGO | 빈티지 키즈 셀렉트샵",
  description: "빈티지 수입 아동복 마켓, 자유롭고 감성적인 아이들을 위한 IPPIEGO.",
  keywords: [
    "키즈 패션", "빈티지 아동복", "수입 아동의류", "보보쇼즈", "미니로디니", "루이스미샤", "아폴리니", "타오", "수입 아동복", "IPPiEGO", "ippiego.shop",
  ],
  authors: [{ name: "IPPIEGO", url: "https://ippiego.shop" }],
  creator: "IPPIEGO",
  metadataBase: new URL("https://ippiego.shop"),
  openGraph: {
    title: "IPPIEGO | 빈티지 키즈 셀렉트샵",
    description: "자유롭고 감성적인 아이들을 위한 빈티지 키즈 셀렉트샵, IPPIEGO.",
    url: "https://ippiego.shop",
    siteName: "IPPIEGO",
    images: [
      {
        url: "/og-image.png", // public 폴더에 넣어주세요
        width: 1200,
        height: 630,
        alt: "IPPIEGO 오픈그래프 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPPIEGO | 빈티지 키즈 셀렉트샵",
    description: "자유롭고 감성적인 아이들을 위한 빈티지 키즈 셀렉트샵",
    images: ["/og-image.jpg"],
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="pt-14 pb-14"> {/* 헤더 높이 만큼 여백 */}
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}

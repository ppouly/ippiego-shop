// src/app/layout.tsx

import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";

export const metadata = {
  title: "IPPIEGO | 빈티지 키즈 셀렉트샵",
  description: "자유롭고 감각적인 빈티지 키즈 패션, IPPIEGO에서 만나보세요.",
  metadataBase: new URL("https://your-deploy-url.vercel.app"),
  openGraph: {
    title: "IPPIEGO",
    images: ["/og-image.png"],
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="pt-14"> {/* 헤더 높이 만큼 여백 */}
        <Header />
        {children}
      </body>
    </html>
  );
}

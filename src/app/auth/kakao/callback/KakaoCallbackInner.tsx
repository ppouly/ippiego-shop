"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      fetch("/api/auth/kakao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text(); // HTML 포함 에러 메시지
            throw new Error(`서버 응답 실패: ${errorText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ 로그인 성공:", data);
          router.push("/orders"); // ✅ orders 페이지로 이동
        })
        .catch((err) => {
          console.error("❌ 로그인 실패:", err.message);
        });
    }
  }, [code, router]);

  return <div className="p-10">로그인 중...</div>;
}

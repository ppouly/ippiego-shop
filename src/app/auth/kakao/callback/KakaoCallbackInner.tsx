"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    const redirectAfterLogin = localStorage.getItem("redirectAfterLogin") || "/";

    if (code) {
      fetch("/api/auth/kakao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",      // ← 여기 추가
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ kakao login error", errorText);
            throw new Error(`서버 응답 실패: ${errorText}`);
          }
          return res.json();
        })
        .then(() => {
          // ✅ 유저 정보 요청 (JWT 쿠키 기반)
          return fetch("/api/auth/me", { credentials: "include" });
        })
        .then((res) => res.json())
        .then((user) => {
          if (user.kakaoId) {
            localStorage.setItem("user", JSON.stringify(user));
          } else {
            console.warn("유저 정보 없음:", user);
          }
          localStorage.removeItem("redirectAfterLogin");
          router.push(redirectAfterLogin);
        })
        .catch((err) => {
          console.error("❌ 로그인 실패:", err.message);
        });
    }
  }, [code, router]);

  return <div className="p-10">로그인 중...</div>;
}

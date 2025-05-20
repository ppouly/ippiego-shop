"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get("orderId");
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrderAmount = async () => {
      if (!orderId) return;
  
      try {
        const res = await fetch(`/api/get-temp-order?orderId=${orderId}`);
        const result = await res.json();
  
        if (result.success && result.order?.total_amount) {
          setTotalAmount(result.order.total_amount);
        }
      } catch (err) {
        console.error("임시 주문 금액 조회 실패:", err);
      }
    };
  
    fetchOrderAmount();
  }, [orderId]);
  
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const result = await res.json();

        if (result.kakaoId) {
          router.replace(`/checkout/member?orderId=${orderId}`);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("로그인 확인 실패:", err);
        setIsLoading(false);
      }
    };

    checkLogin();
  }, [router, orderId]);

  const handleKakaoLogin = () => {
    const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
    const redirectPath = `/checkout/member?orderId=${orderId}`;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code`;

    localStorage.setItem("redirectAfterLogin", redirectPath);
    window.location.href = kakaoAuthUrl;
  };

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="p-4 space-y-6 text-[15px] text-gray-800">
      <h1 className="text-lg font-semibold text-gray-900">주문 방법 선택</h1>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push(`/checkout/phone?orderId=${orderId}`)}
          className="w-full py-3 border rounded text-center font-semibold"
        >
          비회원으로 주문하기
        </button>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full py-3 border rounded text-center font-semibold bg-yellow-300 hover:bg-yellow-400"
        >
          카카오 로그인 후 회원 주문하기
        </button>

        <p className="text-xs text-orange">
          {totalAmount
            ? `[추천] 카카오로 로그인하고 ₩${Math.floor(totalAmount * 0.05).toLocaleString()} 할인 받기`
            : "카카오 회원가입 시 추가 5% 할인"}
        </p>

      </div>
    </div>
  );
}

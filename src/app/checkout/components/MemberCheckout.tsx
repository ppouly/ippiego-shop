"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderForm from "./OrderForm";

interface User {
  kakaoId: string;
  email: string;
  nickname: string;
}

export default function MemberCheckout() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;
  const orderName = searchParams.get("orderName") || "Ippie 상품 결제";
  const productId = searchParams.get("productId") || "unknown";
  const productImage = `/products/${productId}/main.jpg`;

  const [user, setUser] = useState<User | null>(null);
  const [phoneRest, setPhoneRest] = useState("");

  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

  useEffect(() => {
    const checkLogin = async () => {
      const res = await fetch("/api/me");
      const result = await res.json();
      if (result.user) {
        setUser(result.user);
      }
    };
    checkLogin();
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">로그인이 필요합니다</h2>
        <button
          onClick={() => {
            localStorage.setItem("redirectAfterLogin", "/checkout");
            window.location.href = kakaoAuthUrl;
          }}
          className="bg-yellow-400 px-6 py-3 rounded-lg font-bold text-black hover:bg-yellow-300"
        >
          카카오 로그인하기
        </button>
      </div>
    );
  }

return (
  <OrderForm
    isMember={true}
    isVerified={true}
    phoneRest={phoneRest}
    setPhoneRest={setPhoneRest}
    amount={amount}
    orderName={orderName}
    productId={productId}
    productImage={productImage}
  />
);
}

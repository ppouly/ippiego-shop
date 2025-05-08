"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderForm from "./OrderForm";

interface User {
  kakaoId: string;
  email: string;
  nickname: string;
  phone?: string;
  address?: string;
}

interface TempOrder {
  products: {
    product_id: number;
    order_name: string;
    amount: number;
  }[];
  total_amount: number;
}

export default function MemberCheckout() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<TempOrder | null>(null);
  const [phoneRest, setPhoneRest] = useState("");

  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code`;

  useEffect(() => {
    const fetchLogin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const result = await res.json();
        if (result.kakaoId) {
          setUser(result); // 전체 객체가 유저
          if (result.phone?.startsWith("010")) {
            setPhoneRest(result.phone.slice(3));
          }
        }
        
      } catch (error) {
        console.error("로그인 정보 조회 실패:", error);
      }
    };
  
    fetchLogin();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const res = await fetch(`/api/get-temp-order?orderId=${orderId}`);
        const result = await res.json();
        if (result.success) {
          setOrder({
            products: result.order.products,
            total_amount: result.order.total_amount,
          });
        } else {
          console.error("주문 정보 조회 실패:", result.message);
        }
      } catch (error) {
        console.error("주문 정보 요청 실패:", error);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">로그인이 필요합니다</h2>
        <button
          type="button"
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

  if (!order) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">주문 정보를 불러오는 중...</h2>
      </div>
    );
  }

  return (
    <OrderForm
      isMember
      isVerified
      phoneRest={phoneRest}
      setPhoneRest={setPhoneRest}
      products={order.products}
      totalAmount={order.total_amount}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderForm from "./OrderForm";

interface User {
  kakaoId: string;
  email: string;
  nickname: string;
}

interface TempOrder {
  product_id: string;
  amount: number;
  order_name: string;
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
        const res = await fetch("/api/me");
        const result = await res.json();
        if (result.user) {
          setUser(result.user);
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
            product_id: result.order.product_id,
            amount: result.order.amount,
            order_name: result.order.order_name,
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
      amount={order.amount}
      orderName={order.order_name}
      productId={order.product_id}
      productImage={`/products/${order.product_id}/main.jpg`}
    />
  );
}

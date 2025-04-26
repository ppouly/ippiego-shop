"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  // URL 쿼리에서 받아오기
  const productId = searchParams.get("productId");
  const amount = searchParams.get("amount");
  const orderName = searchParams.get("orderName");

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session) {
          router.replace("/checkout/member");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("로그인 체크 실패:", error);
        setIsLoading(false);
      }
    };

    checkLogin();
  }, [router]);

  const handleNonMemberOrder = async () => {
    if (!productId || !amount || !orderName) {
      alert("상품 정보가 없습니다. 다시 선택해주세요.");
      router.push("/"); // 홈으로 보내거나 상품목록으로
      return;
    }

    try {
      const res = await fetch("/api/create-temp-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productId),
          amount: Number(amount),
          orderName,
        }),
      });

      const result = await res.json();

      if (result.success) {
        router.push(`/checkout/phone?orderId=${result.orderId}`);
      } else {
        alert("주문 생성 실패: " + result.message);
      }
    } catch (error) {
      console.error("임시 주문 생성 실패:", error);
      alert("서버 오류가 발생했습니다.");
    }
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
          onClick={handleNonMemberOrder}
          className="w-full py-3 border rounded text-center font-semibold"
        >
          비회원으로 주문하기
        </button>

        <button
          type="button"
          onClick={() => router.push("/login?redirect=/checkout/member")}
          className="w-full py-3 border rounded text-center font-semibold bg-yellow-300"
        >
          카카오 로그인 후 회원 주문하기
        </button>
        <p className="text-xs text-orange-800">카카오 회원가입 서비스 준비 중 입니다.</p>
      </div>
    </div>
  );
}

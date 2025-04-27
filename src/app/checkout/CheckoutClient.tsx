"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get("orderId"); // ✅ 오직 orderId만 받아야 함

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session) {
          router.replace(`/checkout/member?orderId=${orderId}`);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("로그인 체크 실패:", error);
        setIsLoading(false);
      }
    };

    checkLogin();
  }, [router, orderId]);

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="p-4 space-y-6 text-[15px] text-gray-800">
      <h1 className="text-lg font-semibold text-gray-900">주문 방법 선택</h1>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            router.push(`/checkout/phone?orderId=${orderId}`);
          }}
          className="w-full py-3 border rounded text-center font-semibold"
        >
          비회원으로 주문하기
        </button>

        <button
          type="button"
          onClick={() => router.push(`/login?redirect=/checkout/member?orderId=${orderId}`)}
          className="w-full py-3 border rounded text-center font-semibold bg-yellow-300"
        >
          카카오 로그인 후 회원 주문하기
        </button>

        <p className="text-xs text-orange-800">카카오 회원가입 서비스 준비 중입니다.</p>
      </div>
    </div>
  );
}

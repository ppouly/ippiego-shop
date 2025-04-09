"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function OrderCompletePage() {
  const router = useRouter();
  const { clearCart } = useCartStore();

  useEffect(() => {
    // ✅ 1. URL에서 결제 관련 파라미터 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      alert("결제 정보가 누락되어 있습니다.");
      return;
    }

    // ✅ 2. /api/payment 으로 승인 요청 보내기
    const confirmPayment = async () => {
      try {
        const res = await fetch("/api/payment", {
          method: "POST",
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });

        const result = await res.json();

        if (!res.ok) {
          alert("결제 승인에 실패했습니다.");
          console.error("결제 승인 실패:", result);
          return;
        }

        console.log("✅ 결제 승인 성공:", result);

        // ✅ 3. 승인 성공 시 장바구니 비우기
        clearCart();
      } catch (err) {
        console.error("결제 승인 중 에러:", err);
        alert("결제 승인 처리 중 문제가 발생했습니다.");
      }
    };

    confirmPayment();
  }, [clearCart]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-gray-600 text-2xl font-bold mb-4">🎉 주문이 완료되었습니다!</h1>
      <p className="mb-6 text-gray-600">주문해 주셔서 감사합니다.</p>
      <button
        className="bg-black text-white py-3 px-6 rounded-lg text-sm"
        onClick={() => router.push("/")}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

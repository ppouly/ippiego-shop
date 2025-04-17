"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function OrderCompleteClient() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const productId = searchParams.get("productId"); // 상품 ID도 URL에서 받아옴

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || !productId) return;

    const confirmAndSave = async () => {
      const res = await fetch(
        `/api/payment/confirm?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`
      );
      const data = await res.json();
      if (!data?.paymentKey) {
        console.error("❌ 결제 승인 실패", data);
        return;
      }

      // 1. 주문 정보 저장
      const { error: orderError } = // OrderCompleteClient.tsx

      await supabase
        .from("orders")
        .update({
          payment_key: paymentKey,
          status: "결제완료",
        })
        .eq("order_id", orderId);
      

      if (orderError) {
        console.error("❌ 주문 저장 실패:", orderError);
        return;
      }

      // 2. 상품 상태 업데이트
      const { error: updateError } = await supabase
        .from("products")
        .update({ status: "판매완료" })
        .eq("id", productId);

      if (updateError) {
        console.error("❌ 상품 상태 업데이트 실패:", updateError);
      } else {
        console.log("✅ 상품 상태 판매완료 처리 완료");
      }
    };

    confirmAndSave();
  }, [paymentKey, orderId, amount, productId, supabase]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">🎉 결제가 완료되었습니다!</h1>
      <p className="mt-2 text-gray-600">주문번호: {orderId}</p>
    </div>
  );
}

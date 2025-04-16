"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function OrderCompleteClient() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;

    const confirmAndSave = async () => {
      const res = await fetch(
        `/api/payment/confirm?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`
      );
      const data = await res.json();
      if (!data?.paymentKey) {
        console.error("❌ 결제 승인 실패", data);
        return;
      }

      const { error } = await supabase.from("orders").insert({
        order_id: orderId,
        payment_key: paymentKey,
        amount: Number(amount),
      });

      if (error) console.error("❌ 주문 저장 실패:", error);
      else console.log("✅ 주문 저장 완료");
    };

    confirmAndSave();
  }, [paymentKey, orderId, amount, supabase]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">🎉 결제가 완료되었습니다!</h1>
      <p className="mt-2 text-gray-600">주문번호: {orderId}</p>
    </div>
  );
}

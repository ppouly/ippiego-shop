// src/app/checkout/CheckoutClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface TossPaymentsInstance {
  requestPayment(options: {
    method: string;
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    successUrl: string;
    failUrl: string;
  }): void;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const rawAmount = searchParams.get("amount");
  const amount = rawAmount && !isNaN(Number(rawAmount)) ? Number(rawAmount) : 0;
  const orderName = searchParams.get("orderName") || "Ippie 상품 결제";
  const productId = searchParams.get("productId") || "unknown";

  const [tossPayments, setTossPayments] = useState<TossPaymentsInstance | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    script.onload = () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const tp = window.TossPayments?.(clientKey);
      if (tp) {
        setTossPayments(tp);
        console.log("✅ TossPayments SDK 로드됨");
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    if (!tossPayments || amount <= 0) {
      console.error("❌ 결제 불가: 초기화 실패 또는 금액 오류");
      return;
    }

    const orderId = `order-${Date.now()}`;
    const successUrl = `${window.location.origin}/order-complete?productId=${productId}&orderId=${orderId}&amount=${amount}`;
    const failUrl = `${window.location.origin}/order-fail`;

    console.log("💳 amount:", amount, "📦 productId:", productId);

    tossPayments.requestPayment({
      method: "CARD",
      amount,
      orderId,
      orderName,
      customerName: "홍길동",
      customerEmail: "hong@example.com",
      successUrl,
      failUrl,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">IppieGo 결제</h1>
      {amount > 0 ? (
        <>
          <p className="mb-2 text-sm text-gray-700">🛍 상품명: {orderName}</p>
          <p className="mb-4 text-sm text-gray-700">💳 결제금액: ₩{amount.toLocaleString()}</p>
        </>
      ) : (
        <p className="text-red-500">❌ 잘못된 결제 요청입니다.</p>
      )}

      <button
        onClick={handleClick}
        disabled={!tossPayments || amount <= 0}
        className={`w-full py-3 rounded transition ${
          tossPayments && amount > 0
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {tossPayments ? "결제하기" : "로딩 중..."}
      </button>
    </div>
  );
}

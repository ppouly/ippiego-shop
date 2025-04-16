"use client";

import { useEffect, useState } from "react";

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

export default function CheckoutPage() {
  const [tossPayments, setTossPayments] = useState<TossPaymentsInstance | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    script.onload = () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        console.error("❌ 환경변수 누락: NEXT_PUBLIC_TOSS_CLIENT_KEY");
        return;
      }

      if (typeof window !== "undefined" && window.TossPayments) {
        const tp = window.TossPayments(clientKey);
        setTossPayments(tp);
        console.log("✅ TossPayments loaded:", tp);
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    if (!tossPayments) return;

    const successUrl =
      process.env.NEXT_PUBLIC_TOSS_SUCCESS_URL || `${window.location.origin}/order-complete`;
    const failUrl =
      process.env.NEXT_PUBLIC_TOSS_FAIL_URL || `${window.location.origin}/order-fail`;

    tossPayments.requestPayment({
      method: "CARD",
      amount: 50000,
      orderId: `order-${Date.now()}`,
      orderName: "Ippie 상품 결제",
      customerName: "홍길동",
      customerEmail: "hong@example.com",
      successUrl,
      failUrl,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">IppieGo 결제</h1>
      <button
        onClick={handleClick}
        disabled={!tossPayments}
        className={`w-full py-3 rounded transition ${
          tossPayments ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {tossPayments ? "결제하기" : "로딩 중..."}
      </button>
    </div>
  );
}

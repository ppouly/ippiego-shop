"use client";

import { useEffect, useState } from "react";

interface TossPayments {
  (clientKey: string): TossPaymentsInstance;
}

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
    TossPayments?: TossPayments;
  }
}

export default function CheckoutPage() {
  const [tossPayments, setTossPayments] = useState<TossPaymentsInstance | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded) return;

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      console.error("❌ 환경변수 누락: NEXT_PUBLIC_TOSS_CLIENT_KEY");
      return;
    }

    if (typeof window !== "undefined" && window.TossPayments) {
      const tp = window.TossPayments(clientKey);
      setTossPayments(tp);
    }
  }, [scriptLoaded]);

  const handleClick = () => {
    if (!tossPayments) return;

    tossPayments.requestPayment({
      method: "CARD",
      amount: 50000,
      orderId: `order-${Date.now()}`,
      orderName: "Ippie 상품 결제",
      customerName: "홍길동",
      customerEmail: "hong@example.com",
      successUrl: `${window.location.origin}/order-complete`,
      failUrl: `${window.location.origin}/order-fail`,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">IppieGo 결제</h1>
      <button
        onClick={handleClick}
        disabled={!tossPayments}
        className={`w-full py-3 rounded ${
          tossPayments ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"
        }`}
      >
        결제하기
      </button>
    </div>
  );
}

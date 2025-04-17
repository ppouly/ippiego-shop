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

  const FREE_SHIPPING_THRESHOLD = 50000;
  const DELIVERY_FEE = 2500;

  const shippingFee = amount < FREE_SHIPPING_THRESHOLD ? DELIVERY_FEE : 0;
  const finalAmount = amount + shippingFee;

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
    const successUrl = `${window.location.origin}/order-complete?productId=${productId}&orderId=${orderId}&amount=${finalAmount}`;
    const failUrl = `${window.location.origin}/order-fail`;

    tossPayments.requestPayment({
      method: "CARD",
      amount: finalAmount,
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
        <div className="text-sm text-gray-800 space-y-1 mb-4">
          <div>🛍 <span className="font-semibold">상품명:</span> {orderName}</div>
          <div>💳 <span className="font-semibold">상품금액:</span> ₩{amount.toLocaleString()}</div>
          <div>
            🚚 <span className="font-semibold">배송비:</span>{" "}
            {shippingFee > 0 ? `₩${shippingFee.toLocaleString()} (₩50,000 미만 주문)` : "무료"}
          </div>
          <div className="pt-2 border-t font-bold text-base text-right">
            총 결제금액: ₩{finalAmount.toLocaleString()}
          </div>
        </div>
      ) : (
        <p className="text-red-500">❌ 잘못된 결제 요청입니다.</p>
      )}

      <button
        onClick={handleClick}
        disabled={!tossPayments || amount <= 0}
        className={`w-full py-3 rounded transition mt-2 ${
          tossPayments && amount > 0
            ? "bg-black text-white hover:bg-gray-900"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {tossPayments ? "결제하기" : "로딩 중..."}
      </button>
    </div>
  );
}

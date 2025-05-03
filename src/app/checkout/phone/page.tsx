"use client";

import { Suspense } from "react";
import PhoneCheckout from "@/components/checkout/PhoneCheckout";
import { LogPageView } from "@/components/LogPageView";

export default function PhoneCheckoutPage() {
  return (
    <div className="p-4">
      <LogPageView path="/checkout/phone" />
      <h1 className="text-lg font-semibold mb-6">비회원 주문서 작성</h1>
      <Suspense fallback={<div>로딩 중...</div>}>
        <PhoneCheckout />
      </Suspense>
    </div>
  );
}

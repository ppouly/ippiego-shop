"use client";

import { Suspense } from "react";
import MemberCheckout from "@/components/checkout/MemberCheckout";

export default function MemberCheckoutPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-6">회원 주문서 작성</h1>
      <Suspense fallback={<div>로딩 중...</div>}>
        <MemberCheckout />
      </Suspense>
    </div>
  );
}

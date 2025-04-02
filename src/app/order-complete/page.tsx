// src/app/order-complete/page.tsx

"use client";

import { useRouter } from "next/navigation";

export default function OrderCompletePage() {
  const router = useRouter();

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">🎉 주문이 완료되었습니다!</h1>
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

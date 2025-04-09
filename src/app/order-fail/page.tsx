"use client";

import { useRouter } from "next/navigation";

export default function OrderFailPage() {
  const router = useRouter();

  return (
    <div className="p-6 text-center">
      <h1 className="text-red-500 text-2xl font-bold mb-4">❌ 결제가 실패했어요</h1>
      <p className="mb-6 text-gray-600">문제가 발생했거나 결제를 취소하셨어요.</p>
      <button
        className="bg-black text-white py-3 px-6 rounded-lg text-sm"
        onClick={() => router.push("/checkout")}
      >
        다시 시도하기
      </button>
    </div>
  );
}

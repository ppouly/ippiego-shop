// src/app/checkout/page.tsx

"use client";

import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [address, setAddress] = useState("");
  const router = useRouter();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleOrder = () => {
    if (!address) {
      alert("배송지를 입력해주세요.");
      return;
    }

    // ✅ 주문 내역을 localStorage에 저장
    const prev = JSON.parse(localStorage.getItem("orders") || "[]");
    const newOrder = {
      items,
      address,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("orders", JSON.stringify([...prev, newOrder]));

    clearCart(); // 장바구니 비우기
    router.push("/order-complete");
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-gray-800 text-xl font-bold mb-4">주문 확인</h1>

      {items.map((item) => (
        <div key={item.id} className="text-gray-600 mb-2">
          <p>
            {item.name} x {item.quantity}
          </p>
        </div>
      ))}

      <p className="text-gray-800 mt-4 font-semibold">총 합계: ₩{total.toLocaleString()}</p>

      <textarea
        className="text-gray-600 w-full border p-2 mt-6"
        rows={4}
        placeholder="배송지를 입력해주세요"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button
        className="mt-4 w-full bg-black text-white py-3 rounded"
        onClick={handleOrder}
      >
        주문하기
      </button>
    </div>
  );
}

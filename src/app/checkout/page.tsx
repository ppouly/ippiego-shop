"use client";

import { useCartStore } from "@/store/cart";
import { useState } from "react";

export default function CheckoutPage() {
  const { items } = useCartStore(); // 🧡 필요한 항목만 가져오기
  const [address, setAddress] = useState("");

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePayment = async () => {
    if (!address) {
      alert("배송지를 입력해주세요.");
      return;
    }
  
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: `order-${Date.now()}`,
          orderName: items.map((i) => i.name).join(", "),
          amount: total,
          customerName: "홍길동",
        }),
      });
  
      const data = await res.json();
      console.log("💬 Toss 결제 응답 데이터:", data);
  
      if (!res.ok) {
        alert("결제창 생성 실패: " + (data.message || "알 수 없는 에러"));
        return;
      }
  
      const { paymentUrl } = data;
  
      localStorage.setItem("checkout_address", address);
      localStorage.setItem("checkout_items", JSON.stringify(items));
  
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("❌ 결제 요청 실패:", error);
      alert("결제 요청 중 문제가 발생했습니다.");
    }
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

      <p className="text-gray-800 mt-4 font-semibold">
        총 결제금액: ₩{total.toLocaleString()}
      </p>

      <textarea
        className="text-gray-600 w-full border p-2 mt-6"
        rows={4}
        placeholder="배송지를 입력해주세요"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button
        className="mt-4 w-full bg-black text-white py-3 rounded"
        onClick={handlePayment}
      >
        결제하기
      </button>
    </div>
  );
}

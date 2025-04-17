"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartPage() {
  const { items, removeFromCart } = useCartStore();
  const router = useRouter();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    console.log("장바구니 상태:", items);
  }, [items]);

  return (
    <div className="p-4 pb-28">
      <h1 className="text-gray-800 text-xl font-bold mb-4">장바구니</h1>

      {items.length === 0 ? (
        <p>장바구니가 비어 있어요 🛒</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b py-3"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-400">
                ₩{item.price.toLocaleString()}
              </p>
              <div className="mt-2 text-sm text-gray-600">수량: 1개</div>
            </div>
            <button
              className="text-red-500 text-sm"
              onClick={() => removeFromCart(item.id)}
            >
              삭제
            </button>
          </div>
        ))
      )}

      {items.length > 0 && (
        <>
          <div className="text-gray-800 mt-6 text-right font-bold">
            총 합계: ₩{total.toLocaleString()}
          </div>

          {/* 하단 고정 주문 버튼 */}
          <div className="fixed bottom-[64px] left-0 w-full bg-white p-4 shadow-md">
          <button
            className="w-full bg-black text-white py-3 rounded-lg text-sm"
            onClick={() => {
              const item = items[0]; // 단일 상품 기준 (다중 상품이면 추가 로직 필요)
              const orderName =
                items.length > 1 ? `${item.name} 외 ${items.length - 1}건` : item.name;
              const totalAmount = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              router.push(
                `/checkout?amount=${totalAmount}&orderName=${encodeURIComponent(
                  orderName
                )}&productId=${item.id}`
              );
            }}
          >
            주문하기
          </button>

          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogPageView } from "@/components/LogPageView";

export default function CartPage() {
  const { items, removeFromCart } = useCartStore();
  const router = useRouter();
  const [statuses, setStatuses] = useState<{ [productId: number]: string }>({});

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 상품 판매 상태 가져오기
  useEffect(() => {
    if (items.length === 0) return;

    const fetchStatuses = async () => {
      const productIds = items.map((item) => item.id);
      const { data, error } = await supabase
        .from("products")
        .select("id, status")
        .in("id", productIds);

      if (!error && data) {
        const map = data.reduce((acc, cur) => {
          acc[cur.id] = cur.status;
          return acc;
        }, {} as { [key: number]: string });
        setStatuses(map);
      }
    };

    fetchStatuses();
  }, [items]);

  const hasSoldOutItem = items.some(
    (item) => statuses[item.id] === "판매완료" || statuses[item.id] === "환불요청"
  );

// 📍 CartPage.tsx 안쪽, handleOrder 함수 전체를 이렇게 교체하세요
const handleOrder = async () => {
  const products = items.map((item) => {
    const discountRate = item.discountRate ?? 0;
    const basePrice = item.originalPrice ?? item.price;
    const discountedPrice = Math.round(basePrice * (1 - discountRate / 100));

    return {
      product_id: item.id,
      order_name: item.name,
      amount: discountedPrice,
    };
  });

  if (products.length === 0) {
    alert("장바구니에 상품이 없습니다. 다시 담아주세요.");
    return;
  }

  const totalAmount = products.reduce((sum, item) => sum + item.amount, 0);

  try {
    const res = await fetch("/api/create-temp-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products, totalAmount }),
    });

    const result = await res.json();
    if (result.success) {
      router.push(`/checkout?orderId=${result.orderId}`);
    } else {
      alert(`주문 생성 실패: ${result.message}`);
    }
  } catch (error) {
    console.error("주문 생성 에러:", error);
    alert("주문 생성 중 오류가 발생했습니다.");
  }
};


  return (
    <div className="p-4 pb-28">
      <LogPageView path="/cart" />
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
            <p className="font-medium text-gray-800">
              <span
                className="hover:underline cursor-pointer"
                onClick={() => router.push(`/products/${item.id}`)}
              >
                {item.name}
              </span>
              <span className="text-sm text-[#3F8CFF] ml-2">{item.size}</span>
              {["판매완료", "환불요청"].includes(statuses[item.id]) && (
                <span className="ml-2 text-sm text-red-500">(품절)</span>
              )}
            </p>

              <p className="text-sm text-gray-400">
                ₩{item.price.toLocaleString()}
              </p>
              {(item.discountRate ?? 0) > 0 && item.originalPrice && (
                <p className="text-xs text-gray-400 line-through">
                  최초판매가 ₩{item.originalPrice.toLocaleString()} | {item.discountRate}% 할인
                </p>
              )}

              <div className="mt-2 text-sm text-gray-600">수량: {item.quantity}개</div>
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

           {/* ✅ 예상 혜택가 추가 시작 */}
    <div className="text-sm text-right mt-2">
      <p className="text-[#FF6B6B] font-semibold">
        예상 혜택가: ₩{Math.round(total * 0.8).toLocaleString()}
      </p>
      <div className="text-xs text-[#FF6B6B] mt-1">
      <p className="text-xs text-[#FF6B6B] mt-1">
          * 회원주문 5% 상시 할인<br></br>
        * {" "}
            <a
              href="http://pf.kakao.com/_xblzfn"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 hover:opacity-80"
            >카카오채널 
            </a>{" "}추가 시 15% 쿠폰 바로 발급<br></br>
             
            * {" "}
            <a
              href="https://www.instagram.com/ippiego"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 hover:opacity-80"
            >인스타 
            </a>{" "} 
            친구추가 후 말걸면 20% 쿠폰 지급
        </p>
</div>


    </div>
    {/* ✅ 예상 혜택가 추가 끝 */}

          <div className="fixed bottom-[64px] left-0 w-full bg-white p-4 shadow-md">
            {hasSoldOutItem ? (
              <button
                className="w-full bg-gray-300 text-white py-3 rounded-lg text-sm cursor-not-allowed"
                disabled
              >
                품절된 상품이 있어 주문할 수 없습니다
              </button>
            ) : (
              <button
                className="w-full bg-black text-white py-3 rounded-lg text-sm"
                onClick={handleOrder}
              >
                주문하기
              </button>
            )}
          </div>
        </>
      )}
      {/* 📌 5월 베타서비스 배너 */}
      <div className="mt-10">
        <Image
          src="/banner-holiday.png"
          alt="5월 베타서비스 혜택 배너"
          width={768}
          height={831}
          className="w-full h-auto rounded-xl shadow"
        />
      </div>

    </div>
  );
}

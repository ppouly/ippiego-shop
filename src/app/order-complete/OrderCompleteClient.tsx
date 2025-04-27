"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

interface ProductItem {
  product_id: number;
  order_name: string;
}

interface OrderData {
  order_id: string;
  products: ProductItem[];
  total_amount: number;
}

export default function OrderCompleteClient() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const productId = searchParams.get("productId");

  const supabase = createClientComponentClient();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || !productId) return;

    const confirmAndSave = async () => {
      // 1. Toss 서버에 결제 승인 요청
      const res = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: Number(amount),
        }),
      });

      const data = await res.json();
      if (!data?.success) {
        console.error("❌ 결제 승인 실패", data);
        return;
      }

      // 2. 주문 테이블 업데이트
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          payment_key: paymentKey,
          status: "결제완료",
        })
        .eq("order_id", orderId);

      if (orderError) {
        console.error("❌ 주문 저장 실패:", orderError);
        return;
      }

      // 3. 상품 테이블 업데이트
      const { error: updateError } = await supabase
        .from("products")
        .update({ status: "판매완료" })
        .eq("id", Number(productId));

      if (updateError) {
        console.error("❌ 상품 상태 업데이트 실패:", updateError);
      }

      // 4. ✅ 주문 정보 가져오기 (product_id도 같이 가져온다)
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("order_id, products(product_id, order_name), total_amount")
        .eq("order_id", orderId)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ 주문 정보 조회 실패:", fetchError);
      } else {
        setOrderData(order);
      }
    };

    confirmAndSave();
  }, [paymentKey, orderId, amount, productId, supabase]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">🎉 결제가 완료되었습니다!</h1>
      <p className="mt-2 text-gray-600">주문번호: {orderId}</p>

      {/* ✅ 주문 정보 + 이미지 보여주기 */}
      {orderData && (
        <div className="mt-6 text-left space-y-4">
          <h2 className="text-lg font-semibold mb-2">주문 내역</h2>
          <div className="space-y-4">
            {orderData.products?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                  <Image
                    src={`/products/${item.product_id}/main.jpg`}
                    alt={item.order_name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.order_name}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-semibold text-gray-900">
            총 결제금액: ₩{orderData.total_amount.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

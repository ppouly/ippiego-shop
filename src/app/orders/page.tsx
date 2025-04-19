"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

type Order = {
  order_id: string;
  product_id: string;
  address: string;
  amount: number;
  memo: string;
  date?: string;
  name?: string;
  image?: string;
  price?: number;
  delivery_fee?: boolean;
};

export default function OrderHistoryPage() {
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");

  const fullPhone = `010${phone2}${phone3}`;

  const handleSendCode = async () => {
    const res = await fetch("/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullPhone }),
    });
    const result = await res.json();
    if (result.success && result.code) {
      setCode(result.code);
      setMessage(`테스트용 인증번호: ${result.code}`);
    } else {
      setMessage("인증번호 요청 실패");
    }
  };

  const handleVerifyCode = async () => {
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullPhone, code }),
    });
    const result = await res.json();
    if (!result.success) {
      setMessage("인증 실패: " + result.message);
      return;
    }

    setIsVerified(true);
    setMessage("인증 성공! 주문을 조회합니다.");

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", fullPhone)
      .order("created_at", { ascending: false });

    if (orderError || !orderData) {
      console.error("❌ 주문 조회 오류:", orderError?.message);
      setMessage("주문 정보를 불러오는 중 오류가 발생했습니다.");
      return;
    }

    const productIds = [...new Set(orderData.map((o) => o.product_id))];
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    if (productError || !productData) {
      console.error("❌ 상품 정보 조회 오류:", productError?.message);
      setMessage("상품 정보를 불러오는 중 오류가 발생했습니다.");
      return;
    }

    const ordersWithProductInfo = orderData.map((order) => {
      const product = productData.find((p) => p.id === order.product_id);
      return {
        ...order,
        name: product?.name ?? "상품명 없음",
        image: `/products/${order.product_id}/main.jpg`,
      };
    });

    setOrders(ordersWithProductInfo);
  };

  return (
    <div className="p-5 space-y-6 text-[15px] text-gray-800">
      <h1 className="text-xl font-bold text-black">주문 내역 조회</h1>
      {message && <p className={`text-sm ${message.includes("성공") ? "text-green-600" : "text-red-500"}`}>{message}</p>}

      {!isVerified ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" value="010" readOnly className="w-[70px] px-3 py-2 text-center rounded border bg-gray-100 text-gray-500" />
            <input type="text" maxLength={4} value={phone2} onChange={(e) => setPhone2(e.target.value)} className="w-[100px] px-3 py-2 rounded border text-center" placeholder="0000" />
            <input type="text" maxLength={4} value={phone3} onChange={(e) => setPhone3(e.target.value)} className="w-[100px] px-3 py-2 rounded border text-center" placeholder="0000" />
          </div>
          <div className="flex gap-2">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 px-3 py-2 rounded border" placeholder="인증번호 입력" />
            <button onClick={handleSendCode} className="bg-gray-200 px-3 py-2 rounded text-gray-800 text-sm hover:bg-gray-300">인증요청</button>
            <button onClick={handleVerifyCode} className="bg-black text-white px-3 py-2 rounded text-sm hover:bg-gray-800">인증확인</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <p className="text-gray-500">주문 내역이 없습니다.</p>
          ) : (
            orders.map((order, index) => (
              <div key={index} className="border-b pb-5">
                <p className="text-sm text-gray-500 mb-1">🆔 주문번호: {order.order_id}</p>
                <p className="text-sm text-gray-700">배송지: {order.address}</p>
                <p className="text-sm text-gray-700 mb-2">배송메모: {order.memo}</p>

                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden relative">
                    <Image
                      src={order.image ?? ""}
                      alt={order.name ?? "상품 이미지"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-sm">
                    <Link href={`/products/${order.product_id}`} className="font-semibold text-blue-600 hover:underline">
                      {order.name}
                    </Link>
                    <p className="text-gray-500">상품번호: {order.product_id}</p>
                    {order.delivery_fee ? (
                      <>
                        <p>상품금액: ₩{(order.amount - 2500).toLocaleString()}</p>
                        <p>배송비: +₩2,500</p>
                        <p className="text-black font-bold">총 결제금액: ₩{order.amount.toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="text-black font-bold">총 결제금액: ₩{order.amount.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

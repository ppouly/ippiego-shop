"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";

interface Product {
  product_id: number;
  order_name: string;
  amount: number;
}

interface Order {
  order_id: string;
  products: Product[];
  address: string;
  memo: string;
  delivery_fee?: boolean;
  delivery_complete_date?: string;
  status?: string;
}

export default function OrderHistoryPage() {
  const [user, setUser] = useState<{ kakaoId: string; email: string; nickname: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [refundMessage, setRefundMessage] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const res = await fetch("/api/auth/me");
      const result = await res.json();
      if (result?.kakaoId) {
        setUser(result);
        await fetchOrdersByKakaoId(result.kakaoId);
      }
    };
    checkLogin();
  }, []);

  const fetchOrdersByKakaoId = async (kakaoId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("kakao_id", kakaoId)
      .order("created_at", { ascending: false });

    console.log("📦 kakaoId로 조회:", kakaoId);
    console.log("🧾 orderData:", data);
    console.log("🐛 error:", error);

    if (error || !data) {
      setMessage("주문 정보를 불러오는 중 오류가 발생했습니다.");
      return;
    }

    setOrders(data as Order[]);
  };

  const handleRefundToggle = async (order: Order, productId: number) => {
    setLoadingOrderId(order.order_id);
    const isRefunding = order.status === "환불요청";

    if (isRefunding) {
      await supabase.from("orders").update({ status: "결제완료" }).eq("order_id", order.order_id);
      await supabase.from("products").update({ status: "판매완료" }).eq("id", productId);
      setRefundMessage(null);
    } else {
      const now = dayjs();
      if (order.delivery_complete_date) {
        const completedDate = dayjs(order.delivery_complete_date);
        const diff = now.diff(completedDate, "day");
        if (diff > 10) {
          setLoadingOrderId(null);
          return;
        }
      }

      await supabase.from("orders").update({ status: "환불요청" }).eq("order_id", order.order_id);
      await supabase.from("products").update({ status: "환불요청" }).eq("id", productId);
      setRefundMessage("환불 신청이 완료되었습니다. 택배 기사를 통해 반품 수거가 진행되며, 상품 검수 후 왕복 배송비를 제외한 금액이 환불됩니다.");
    }

    if (user) await fetchOrdersByKakaoId(user.kakaoId);
    setLoadingOrderId(null);
  };

  return (
    <div className="p-5 space-y-6 text-[15px] text-gray-800">
      <h1 className="text-xl font-bold text-black">주문 내역 조회</h1>
      {message && <p className={`text-sm ${message.includes("성공") ? "text-green-600" : "text-red-500"}`}>{message}</p>}
      {refundMessage && <p className="text-sm text-blue-600">{refundMessage}</p>}

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-gray-500">주문 내역이 없습니다.</p>
        ) : (
          orders.map((order) => {
            const isWithin10Days = order.delivery_complete_date
              ? dayjs().diff(dayjs(order.delivery_complete_date), "day") <= 10
              : true;
            const isRefundable = isWithin10Days && order.status !== "환불완료";

            return (
              <div key={order.order_id} className="border-b pb-5">
                <p className="text-sm text-gray-500 mb-1">🆔 주문번호: {order.order_id}</p>
                <p className="text-sm text-gray-700">배송지: {order.address}</p>
                <p className="text-sm text-gray-700 mb-2">배송메모: {order.memo}</p>

                {order.products?.map((product) => (
                  <div key={product.product_id} className="flex gap-4 items-center pt-5">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden relative">
                      <Image
                        src={`/products/${product.product_id}/main.jpg`}
                        alt={product.order_name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <Link href={`/products/${product.product_id}`} className="font-semibold text-blue-600 hover:underline">
                        {product.order_name}
                      </Link>
                      <p className="text-black font-bold">₩{product.amount.toLocaleString()}</p>

                      {isRefundable ? (
                        <button
                          disabled={loadingOrderId === order.order_id}
                          className={`mt-2 text-sm px-3 py-1 rounded transition ${order.status === "환불요청" ? "bg-gray-400 text-white" : "bg-red-500 text-white hover:bg-red-600"}`}
                          onClick={() => handleRefundToggle(order, product.product_id)}
                        >
                          {order.status === "환불요청" ? "환불 취소" : "환불 신청"}
                        </button>
                      ) : order.status === "환불완료" ? (
                        <p className="text-sm text-gray-500 mt-1">환불 완료</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

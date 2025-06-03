"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  refund_product_ids?: number[];
  address: string;
  memo: string;
  delivery_fee?: boolean;
  delivery_complete_date?: string;
  delivery_status?: string;
  status?: string;
  total_amount: number;
  created_at: string; // ✅ 주문일시 추가
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ kakaoId: string; email: string; nickname: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewTokens, setReviewTokens] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/auth/me");
      const result = await res.json();
      if (result?.kakaoId) {
        setUser(result);
        await fetchOrdersByKakaoId(result.kakaoId);
        await fetchReviewTokens();
      }
    };
  
    init();
  
    // ✅ 뒤로가기 시 강제로 refresh
    const handlePopState = () => {
      router.refresh();
    };
  
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);
  

  const fetchOrdersByKakaoId = async (kakaoId: string) => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "order_id, products, refund_product_ids, address, total_amount, memo, delivery_fee, delivery_status, delivery_complete_date, status, created_at" // ✅ created_at 추가
      )
      .eq("kakao_id", kakaoId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      setMessage("주문 정보를 불러오는 중 오류가 발생했습니다.");
      return;
    }

    setOrders(data as Order[]);
  };

  const fetchReviewTokens = async () => {
    const { data, error } = await supabase
      .from("reviews_tokens")
      .select("order_id, product_id, token");

    if (error || !data) {
      console.error("리뷰 토큰 조회 오류:", error);
      return;
    }

    const tokenMap: Record<string, string> = {};
    data.forEach((item: { order_id: string; product_id: string; token: string }) => {
      const key = `${item.order_id}_${item.product_id}`;
      tokenMap[key] = item.token;
    });
    setReviewTokens(tokenMap);
  };

  const handleRefundToggle = async (order: Order, productId: number) => {
    setLoadingOrderId(order.order_id);

    const isCurrentlyRefunding = order.refund_product_ids?.includes(productId);

    if (!isCurrentlyRefunding) {
      setNoticeMessage(
        "택배 기사가 상품을 수거할 예정입니다.\n상품 검수 후, 왕복 배송비를 제외한 금액이 환불 처리됩니다.\n상품 택이 제거된 경우, 상품 금액의 30%가 추가로 차감됩니다."
      );

      setTimeout(() => {
        setNoticeMessage(null);
      }, 10000);
    }

    if (order.delivery_complete_date) {
      const completedDate = dayjs(order.delivery_complete_date);
      if (dayjs().diff(completedDate, "day") > 10) {
        setMessage("배송완료일로부터 10일 초과되어 환불이 불가합니다.");
        setLoadingOrderId(null);
        return;
      }
    }

    if (isCurrentlyRefunding) {
      await supabase.from("products").update({ status: "판매완료" }).eq("id", productId);
      const updatedRefundIds = order.refund_product_ids?.filter(id => id !== productId) || [];
      await supabase.from("orders").update({ refund_product_ids: updatedRefundIds }).eq("order_id", order.order_id);
    } else {
      await supabase.from("products").update({ status: "환불요청" }).eq("id", productId);
      const updatedRefundIds = [...(order.refund_product_ids ?? []), productId];
      await supabase.from("orders").update({ refund_product_ids: updatedRefundIds }).eq("order_id", order.order_id);
    }

    if (user) await fetchOrdersByKakaoId(user.kakaoId);
    setLoadingOrderId(null);
  };

  return (
    <div className="p-5 space-y-6 text-[15px] text-gray-800">
      <h1 className="text-xl font-bold text-black">주문 내역 조회</h1>
      {message && <p className="text-sm text-red-500">{message}</p>}
      {noticeMessage && (
        <p className="text-sm text-blue-600 whitespace-pre-line">{noticeMessage}</p>
      )}

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-gray-500">주문 내역이 없습니다.</p>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className="border-b pb-5">
              <p className="text-sm text-gray-500 mb-1"> 주문번호: {order.order_id}</p>
              <p className="text-xs text-gray-400 mb-1">  
                 주문일시: {dayjs(order.created_at).format("YYYY년 M월 D일 HH:mm")}
              </p>
              <p className="text-sm text-gray-700">배송지: {order.address}</p>
              <p className="text-sm text-gray-700 mb-2">배송메모: {order.memo}</p>
              <p className="font-bold text-gray-800 mb-2">
                {order.delivery_status || "배송준비중"}
              </p>

              {order.products?.map((product) => {
                const isRefunding = order.refund_product_ids?.includes(product.product_id);
                const reviewToken = reviewTokens[`${order.order_id}_${product.product_id}`];

                return (
                  <div key={product.product_id} className="flex gap-4 items-center pt-5">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden relative">
                      <Image
                        src={`/products/${product.product_id}/main.webp`}
                        alt={product.order_name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 space-y-1 text-sm">
                      <Link
                        href={`/products/${product.product_id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {product.order_name}
                      </Link>
                      <p className="text-black font-bold">
                        ₩{product.amount.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          disabled={loadingOrderId === order.order_id}
                          className={`text-sm px-3 py-1 rounded transition ${
                            isRefunding
                              ? "bg-gray-400 text-white"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                          onClick={() => handleRefundToggle(order, product.product_id)}
                        >
                          {isRefunding ? "환불 취소" : "환불 신청"}
                        </button>

                        {reviewToken && (
                          <Link
                            href={`http://ippiego.shop/review-write?token=${reviewToken}`}
                            className="text-sm px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                          >
                            리뷰쓰기
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="mt-4 font-bold text-right">
                총 결제금액: ₩{(order.total_amount ?? 0).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

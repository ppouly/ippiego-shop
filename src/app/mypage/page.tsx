"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

interface User {
  kakaoId: string;
  email?: string;
  nickname?: string;
}

interface Order {
  order_id: string;
  product_id: string;
  address: string;
  amount: number;
  memo: string;
  delivery_fee?: boolean;
  name?: string;
  image?: string;
  delivery_complete_date?: string;
  status?: string;
}

interface RawOrder extends Omit<Order, "name" | "image"> {
    products?: { name?: string }[];
  }
  

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [phoneRest, setPhoneRest] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const fullPhone = `010${phoneRest}`;

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleSendCode = async () => {
    const res = await fetch("/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullPhone }),
    });
    const result = await res.json();

    if (result.success) {
      setMessage("인증번호가 발송되었습니다.");
    } else {
      setMessage("인증번호 요청 실패: " + (result.message || ""));
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
    setMessage("인증 성공! 주문을 불러옵니다.");

    await fetchOrdersByPhone();
  };

  const fetchOrdersByPhone = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id,
        product_id,
        address,
        amount,
        memo,
        delivery_fee,
        status,
        delivery_complete_date,
        products(name)
      `)
      .eq("phone", fullPhone)
      .order("created_at", { ascending: false });
  
    if (error || !data) {
      setMessage("주문 조회 실패");
      return;
    }
  
    const enriched: Order[] = (data as RawOrder[]).map((order) => ({
        ...order,
        name: Array.isArray(order.products) ? order.products[0]?.name ?? "상품명 없음" : "상품명 없음",
        image: `/products/${order.product_id}/main.jpg`,
      }));
      
  
    setOrders(enriched);
  };
  


  const handleRefundToggle = async (order: Order) => {
    if (!isVerified) {
      setMessage("먼저 인증을 완료해주세요.");
      return;
    }

    setLoadingOrderId(order.order_id);
    const isRefunding = order.status === "환불요청";

    if (isRefunding) {
      await supabase.from("orders").update({ status: "결제완료" }).eq("order_id", order.order_id);
      await supabase.from("products").update({ status: "판매완료" }).eq("id", order.product_id);
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
      await supabase.from("products").update({ status: "환불요청" }).eq("id", order.product_id);
    }

    await fetchOrdersByPhone();
    setLoadingOrderId(null);
  };

  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">비회원 주문 조회</h1>

        {!isVerified ? (
          <>
            <form className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value="010"
                  readOnly
                  className="w-[70px] px-3 py-2 bg-gray-100 text-center rounded border border-gray-300 text-gray-500 text-[15px]"
                />
                <input
                  type="text"
                  maxLength={8}
                  value={phoneRest}
                  onChange={(e) => setPhoneRest(e.target.value.replace(/[^0-9]/g, ""))}
                  className="flex-1 min-w-[180px] px-3 py-2 rounded border border-gray-300 text-[15px]"
                  placeholder="12345678"
                />
              </div>
              <input
                placeholder="인증번호"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="border p-2 w-full"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleSendCode} className="bg-gray-200 text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm hover:bg-gray-300">
                  인증요청
                </button>
                <button type="button" onClick={handleVerifyCode} className="bg-black text-white rounded px-3 py-2 text-sm hover:bg-gray-800">
                  인증확인
                </button>
              </div>
              {message && <p className="text-sm text-red-500">{message}</p>}
            </form>

            <div className="mt-6 text-center">
              <p className="mb-2">또는</p>
              <a href={kakaoAuthUrl}>
              <button
            onClick={() => {
                localStorage.setItem("redirectAfterLogin", "/orders"); // ✅ 로그인 후 돌아갈 주소를 /orders로 설정
                window.location.href = kakaoAuthUrl; // ✅ 카카오 로그인 URL로 이동
            }}
            className="bg-yellow-400 px-6 py-3 rounded-lg font-bold"
            >
            카카오 로그인하기
            </button>

              </a>
            </div>
          </>
        ) : (
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
                    <p className="text-sm text-gray-700">배송메모: {order.memo}</p>
                    <div className="flex gap-4 items-center pt-5">
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
                        {order.delivery_fee && <p>배송비: +₩3,500</p>}
                        <p className="text-black font-bold">총 결제금액: ₩{order.amount.toLocaleString()}</p>
                        {isRefundable ? (
                          <button
                            disabled={loadingOrderId === order.order_id}
                            className={`mt-2 text-sm px-3 py-1 rounded transition ${order.status === "환불요청" ? "bg-gray-400 text-white" : "bg-red-500 text-white hover:bg-red-600"}`}
                            onClick={() => handleRefundToggle(order)}
                          >
                            {order.status === "환불요청" ? "환불 취소" : "환불 신청"}
                          </button>
                        ) : order.status === "환불완료" ? (
                          <p className="text-sm text-gray-500 mt-1">환불 완료</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">마이페이지</h1>
      <p>닉네임: {user.nickname}</p>
      <div className="mt-4">
        <a href="/orders" className="underline text-blue-500">
          주문내역 보기 →
        </a>
      </div>
    </div>
  );
}
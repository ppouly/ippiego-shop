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
  phone?: string;     // ✅ 추가
  address?: string;   // ✅ 추가
}

interface ProductItem {
  product_id: number;
  order_name: string;
  amount: number; // ✅ 추가! (상품 개별 가격)
  status?: string;
}

interface Order {
  order_id: string;
  products: ProductItem[];
  refund_product_ids?: number[];
  address: string;
  delivery_status: string;
  total_amount: number;
  memo: string;
  delivery_fee?: boolean;
  delivery_complete_date?: string;
  status?: string;
}

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [phoneRest, setPhoneRest] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const fullPhone = `010${phoneRest}`;

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/me");
        const result = await res.json();
        if (result.user) {
          setUser(result.user);
          setMessage("로그인 상태입니다.");
  
          // ✅ 전화번호 자동 설정
          if (result.user.phone?.startsWith("010")) {
            setPhoneRest(result.user.phone.slice(3));
          }
        }
      } catch (err) {
        console.error("로그인 확인 실패", err);
      }
    };
  
    checkLogin();
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem("user");
    location.reload();
  };

  const handleSendCode = async () => {
    const res = await fetch("/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullPhone }),
    });
    const result = await res.json();

    setMessage(result.success ? "인증번호가 발송되었습니다." : "인증번호 요청 실패: " + (result.message || ""));
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
      .select("order_id, products, refund_product_ids, address, total_amount, memo, delivery_fee,delivery_status, delivery_complete_date, status") // ← 추가됨
      .eq("phone", fullPhone)
      .order("created_at", { ascending: false });
  
    if (error || !data) {
      setMessage("주문 조회 실패");
      return;
    }
  
    setOrders(data as Order[]);
  };
  

  const handleRefundToggle = async (order: Order, productId: number) => {
    if (!isVerified) {
      setMessage("먼저 인증을 완료해주세요.");
      return;
    }

    setLoadingOrderId(order.order_id);

    const isCurrentlyRefunding = order.refund_product_ids?.includes(productId);
    
    if (!isCurrentlyRefunding) {
      setNoticeMessage(
        "택배 기사가 상품을 수거할 예정입니다.\n\n상품 검수 후, 왕복 배송비를 제외한 금액이 환불 처리됩니다.\n\n상품 택이 제거된 경우, 상품 금액의 30%가 추가로 차감됩니다."
      );
   
    
      // ✅ 5초 뒤 메시지 사라지게
      setTimeout(() => {
        setNoticeMessage(null);
      }, 10000);
    }

    if (isCurrentlyRefunding) {
      // 환불 취소
      await supabase.from("products").update({ status: "판매완료" }).eq("id", productId);
      const updatedRefundIds = order.refund_product_ids?.filter(id => id !== productId) || [];
      await supabase.from("orders").update({ refund_product_ids: updatedRefundIds }).eq("order_id", order.order_id);
    } else {
      // 환불 신청
      const now = dayjs();
      if (order.delivery_complete_date) {
        const completedDate = dayjs(order.delivery_complete_date);
        if (now.diff(completedDate, "day") > 10) {
          setMessage("배송완료일로부터 10일 초과되어 환불이 불가합니다.");
          setLoadingOrderId(null);
          return;
        }
      }
      await supabase.from("products").update({ status: "환불요청" }).eq("id", productId);
      const updatedRefundIds = [...(order.refund_product_ids ?? []), productId];
      await supabase.from("orders").update({ refund_product_ids: updatedRefundIds }).eq("order_id", order.order_id);
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
        {noticeMessage && (
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded mb-4 mt-1" style={{ whiteSpace: "pre-line" }}>
            {noticeMessage}
          </div>
        )}

        {!isVerified ? (
          <>
            <form className="space-y-2">
              <div className="flex gap-2">
                <input type="text" value="010" readOnly className="w-[70px] px-3 py-2 bg-gray-100 text-center rounded border border-gray-300 text-gray-500 text-[15px]" />
                <input type="text" maxLength={8} value={phoneRest} onChange={(e) => setPhoneRest(e.target.value.replace(/[^0-9]/g, ""))} className="flex-1 min-w-[180px] px-3 py-2 rounded border border-gray-300 text-[15px]" placeholder="12345678" />
              </div>
              <input placeholder="인증번호" value={code} onChange={(e) => setCode(e.target.value)} className="border p-2 w-full" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleSendCode} className="bg-gray-200 text-gray-800 border border-gray-300 rounded px-3 py-2 text-sm hover:bg-gray-300">인증요청</button>
                <button type="button" onClick={handleVerifyCode} className="bg-black text-white rounded px-3 py-2 text-sm hover:bg-gray-800">인증확인</button>
              </div>
              {message && <p className="text-sm text-red-500">{message}</p>}
            </form>

            <div className="mt-6 text-center">
              <p className="mb-2">또는</p>
              <a href={kakaoAuthUrl}>
                <button className="bg-yellow-400 px-6 py-3 rounded-lg font-bold">카카오 로그인하기</button>
              </a>
              <p className="text-xs text-orange-800">카카오 회원가입 서비스 준비 중 입니다.</p>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <p className="text-gray-500">주문 내역이 없습니다.</p>
            ) : (
              orders.map((order) => (
                <div key={order.order_id} className="border-b pb-5">
                   {/* 배송상태 출력 */}
                   <div className="text-gray-800 mt-1 mb-1 font-bold ">
                     {order.delivery_status || "배송준비중"}
                  </div>   
                  <p className="text-sm text-gray-500 mb-1">🆔 주문번호: {order.order_id}</p>
                  <p className="text-sm text-gray-700">배송지: {order.address}</p>
                  <p className="text-sm text-gray-700">배송메모: {order.memo}</p>

                  {order.products.map((product) => {
  const isRefunding = order.refund_product_ids?.includes(product.product_id); // ← 고쳤다!

  return (
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
        <p>₩{product.amount.toLocaleString()}</p>



        <button
          disabled={loadingOrderId === order.order_id}
          className={`mt-2 text-sm px-3 py-1 rounded transition ${
            isRefunding ? "bg-gray-400 text-white" : "bg-red-500 text-white hover:bg-red-600"
          }`}
          onClick={() => handleRefundToggle(order, product.product_id)}
        >
          {isRefunding ? "환불 취소" : "환불 신청"}
        </button>
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
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">마이페이지</h1>
      <p>전화번호: {user.phone}</p>
      <p>주소: {user.address}</p>
      <div className="mt-4">
        <a href="/orders" className="underline text-blue-500">
          주문내역 보기 →
        </a>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
  
}
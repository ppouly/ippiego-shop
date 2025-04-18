"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface TossPaymentsInstance {
  requestPayment(options: {
    method: string;
    amount: number;
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    successUrl: string;
    failUrl: string;
  }): void;
}

interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: string;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const rawAmount = searchParams.get("amount");
  const amount = rawAmount && !isNaN(Number(rawAmount)) ? Number(rawAmount) : 0;
  const orderName = searchParams.get("orderName") || "Ippie 상품 결제";
  const productId = searchParams.get("productId") || "unknown";
  const productImage = `/products/${productId}/main.jpg`;

  const FREE_SHIPPING_THRESHOLD = 50000;
  const DELIVERY_FEE = 2500;
  const shippingFee = amount < FREE_SHIPPING_THRESHOLD ? DELIVERY_FEE : 0;
  const shippingApplied = shippingFee > 0 ? 1 : 0;
  const finalAmount = amount + shippingFee;

  const [tossPayments, setTossPayments] = useState<TossPaymentsInstance | null>(null);
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [zip, setZip] = useState("");
  const [addr, setAddr] = useState("");
  const [detail, setDetail] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("부재 시 문 앞에 놓아주세요.");
  const [customMemo, setCustomMemo] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    script.onload = () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const tp = window.TossPayments?.(clientKey);
      if (tp) {
        setTossPayments(tp);
      }
    };
    document.body.appendChild(script);
  }, []);

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
    if (result.success) {
      setIsVerified(true);
      setMessage("인증 성공!");
    } else {
      setMessage("인증 실패: " + result.message);
    }
  };

  const handleDaumPostcode = () => {
    if (typeof window !== "undefined" && window.daum?.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: DaumPostcodeData) {
          setZip(data.zonecode);
          setAddr(data.roadAddress);
        },
      }).open();
    } else {
      setMessage("주소 API 로딩이 아직 완료되지 않았어요.");
    }
  };

  const handleClick = async () => {
    if (!tossPayments || amount <= 0 || !isVerified || !addr || !detail || !recipient) {
      setMessage("결제를 진행할 수 없습니다. 정보를 확인해주세요.");
      return;
    }
    const orderId = `order-${Date.now()}`;
    const successUrl = `${window.location.origin}/order-complete?productId=${productId}&orderId=${orderId}&amount=${finalAmount}`;
    const failUrl = `${window.location.origin}/order-fail`;

    await supabase.from("orders").insert({
      order_id: orderId,
      product_id: productId,
      phone: fullPhone,
      address: `${zip} ${addr} ${detail}`,
      recipient,
      memo: memo === "직접 입력" ? customMemo : memo,
      amount: finalAmount,
      verified: true,
      status: "결제대기",
      delivery_fee: shippingApplied,  // ✅ 추가된 필드
    });

    tossPayments.requestPayment({
      method: "CARD",
      amount: finalAmount,
      orderId,
      orderName,
      customerName: recipient,
      customerEmail: "none@ippiego.shop",
      successUrl,
      failUrl,
    });
  };

  return (
    <div className="p-4 space-y-4 text-[15px] text-gray-800">
      <h1 className="text-lg font-semibold text-gray-900">IppieGo 주문서 작성</h1>
      {message && <p className="text-sm text-red-600">{message}</p>}

      <div>
        <label className="block text-[15px] font-semibold text-gray-900">휴대전화 *</label>
        <div className="flex gap-2">
          <input type="text" value="010" readOnly className="border px-3 py-2 rounded w-1/3 bg-gray-100" />
          <input type="text" maxLength={4} value={phone2} onChange={(e) => setPhone2(e.target.value)} className="border px-3 py-2 rounded w-1/3" placeholder="0000" />
          <input type="text" maxLength={4} value={phone3} onChange={(e) => setPhone3(e.target.value)} className="border px-3 py-2 rounded w-1/3" placeholder="0000" />
        </div>
        <div className="flex gap-2 mt-2">
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="border px-3 py-2 w-full rounded" placeholder="인증번호 입력" />
          <button onClick={handleSendCode} className="bg-blue-500 text-white px-3 rounded">인증요청</button>
          <button onClick={handleVerifyCode} className="bg-orange-600 text-white px-3 rounded">인증확인</button>
        </div>
      </div>

      <div>
        <label className="block pt-4 border-t text-[15px] font-semibold text-gray-900">받는사람 *</label>
        <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="border px-3 py-2 w-full rounded text-[15px]" placeholder="이름 입력" />
      </div>

      <div>
        <label className="block text-[15px] font-semibold text-gray-900">주소 *</label>
        <div className="flex gap-2 mb-2">
          <input type="text" value={zip} readOnly className="border px-3 py-2 rounded w-1/2 bg-gray-100" placeholder="우편번호" />
          <button onClick={handleDaumPostcode} className="bg-gray-300 px-3 rounded text-[15px]">주소검색</button>
        </div>
        <input type="text" value={addr} readOnly className="border px-3 py-2 w-full rounded bg-gray-100 mb-2" placeholder="도로명 주소" />
        <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} className="border px-3 py-2 w-full rounded" placeholder="상세 주소 입력" />
      </div>

      <div>
        <label className="block text-[15px] font-semibold text-gray-900">배송 메모</label>
        <select value={memo} onChange={(e) => setMemo(e.target.value)} className="border px-3 py-2 w-full rounded">
          <option>부재 시 문 앞에 놓아주세요.</option>
          <option>경비실에 맡겨주세요.</option>
          <option>배송 전 연락주세요.</option>
          <option>직접 입력</option>
        </select>
        {memo === "직접 입력" && (
          <input
            type="text"
            value={customMemo}
            onChange={(e) => setCustomMemo(e.target.value)}
            className="mt-2 border px-3 py-2 w-full rounded"
            placeholder="배송 메모를 입력하세요"
          />
        )}
      </div>

      <div className="border-t pt-4 text-[14px] text-gray-800 space-y-1">
        <h2 className="text-[15px] font-semibold text-black">주문상품</h2>
        <div className="flex gap-3 items-center mt-2">
          <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 relative">
          <Image
            src={productImage}
            alt="상품 이미지"
            fill
            className="object-cover"
            sizes="80px"
          />
          </div>
          <div className="flex-1 text-[14px] text-gray-800">
            <div className="font-medium">{orderName}</div>
            <div className="text-gray-500">수량: 1개</div>
            <div className="text-[15px] font-semibold text-black mt-1">₩{amount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 text-[15px] text-gray-800 space-y-1">
        <h2 className="font-semibold text-black">결제정보</h2>
        <div className="flex justify-between py-1">
          <span>주문상품</span>
          <span className="font-semibold">₩{amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>배송비</span>
          <span className="font-semibold">+₩{shippingFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>할인/부가결제</span>
          <span className="font-semibold text-red-600">-₩0</span>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded text-right mt-4">
        <span className="text-[16px] font-bold text-blue-600">최종 결제 금액 ₩{finalAmount.toLocaleString()}</span>
      </div>

      <button
        onClick={handleClick}
        disabled={!tossPayments || amount <= 0 || !isVerified || !addr || !detail || !recipient}
        className={`w-full py-3 rounded text-white mt-4 transition ${
          tossPayments && amount > 0 && isVerified ? "bg-black hover:bg-gray-800" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        결제하기
      </button>

      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" />
    </div>
  );
}

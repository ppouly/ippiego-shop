"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/lib/supabase";

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

  const FREE_SHIPPING_THRESHOLD = 50000;
  const DELIVERY_FEE = 2500;
  const shippingFee = amount < FREE_SHIPPING_THRESHOLD ? DELIVERY_FEE : 0;
  const finalAmount = amount + shippingFee;

  const [tossPayments, setTossPayments] = useState<TossPaymentsInstance | null>(null);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [zip, setZip] = useState("");
  const [addr, setAddr] = useState("");
  const [detail, setDetail] = useState("");

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

  const handleSendCode = async () => {
    // await fetch("/api/send-code", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ phone }),
    // });
  //  alert("인증번호가 전송되었습니다.");

 // 테스트용 >> 테스트 끝나면 아래 지우고 위에 주석 살림
    const res = await fetch("/api/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const result = await res.json();

    if (result.success && result.code) {
      setCode(result.code); // 화면에 바로 표시
      alert(`테스트용 인증번호: ${result.code}`);
    } else {
      alert("인증번호 요청 실패");
    }// 여기까지 테스트용용

  };

  

  const handleVerifyCode = async () => {
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const result = await res.json();
    if (result.success) {
      setIsVerified(true);
      alert("인증 성공!");
    } else {
      alert("인증 실패: " + result.message);
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
      alert("주소 API 로딩이 아직 완료되지 않았어요.");
    }
  };
  
  

  const handleClick = async () => {
    if (!tossPayments || amount <= 0 || !isVerified || !addr || !detail) {
      alert("결제를 진행할 수 없습니다. 정보를 확인해주세요.");
      return;
    }

    const orderId = `order-${Date.now()}`;
    const successUrl = `${window.location.origin}/order-complete?productId=${productId}&orderId=${orderId}&amount=${finalAmount}`;
    const failUrl = `${window.location.origin}/order-fail`;

    // Supabase에 주문 정보 저장
    await supabase.from("orders").insert({
      order_id: orderId,
      product_id: productId,
      phone,
      address: `${zip} ${addr} ${detail}`,
      amount: finalAmount,
      verified: true,
      status: "결제대기",
    });

    tossPayments.requestPayment({
      method: "CARD",
      amount: finalAmount,
      orderId,
      orderName,
      customerName: phone,
      customerEmail: "none@ippiego.shop",
      successUrl,
      failUrl,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">IppieGo 주문서 작성</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">휴대폰 번호</label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border px-3 py-2 w-full rounded"
            placeholder="01012345678"
          />
          <button onClick={handleSendCode} className="bg-blue-500 text-white px-3 rounded">
            인증번호 전송
          </button>
        </div>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border px-3 py-2 w-full rounded"
            placeholder="인증번호 입력"
          />
          <button onClick={handleVerifyCode} className="bg-green-600 text-white px-3 rounded">
            인증확인
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">주소</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={zip}
            readOnly
            className="border px-3 py-2 w-full rounded bg-gray-100"
            placeholder="우편번호"
          />
          <button onClick={handleDaumPostcode} className="bg-gray-300 px-3 rounded">
            주소찾기
          </button>
        </div>
        <input
          type="text"
          value={addr}
          readOnly
          className="border px-3 py-2 w-full rounded bg-gray-100"
          placeholder="도로명 주소"
        />
        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          className="border px-3 py-2 w-full rounded"
          placeholder="상세 주소"
        />
      </div>

      <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
        <div>🛍 상품명: {orderName}</div>
        <div>💳 상품금액: ₩{amount.toLocaleString()}</div>
        <div>🚚 배송비: {shippingFee > 0 ? `₩${shippingFee.toLocaleString()} (₩50,000 미만 주문)` : "무료"}</div>
        <div className="font-bold text-right pt-2 border-t">총 결제금액: ₩{finalAmount.toLocaleString()}</div>
      </div>

      <button
        onClick={handleClick}
        disabled={!tossPayments || amount <= 0 || !isVerified || !addr || !detail}
        className={`w-full py-3 rounded text-white mt-2 transition ${
          tossPayments && amount > 0 && isVerified ? "bg-black hover:bg-gray-800" : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        결제하기
      </button>

      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" />
    </div>
  );
}

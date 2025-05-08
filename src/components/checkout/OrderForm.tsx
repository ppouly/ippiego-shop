"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

interface ProductItem {
  product_id: number;
  order_name: string;
  amount: number;
}

interface OrderFormProps {
  products: ProductItem[];
  totalAmount: number;
  isVerified: boolean;
  isMember: boolean;
  phoneRest?: string;
  setPhoneRest?: (value: string) => void;
  code?: string;
  setCode?: (value: string) => void;
  handleSendCode?: () => void;
  handleVerifyCode?: () => void;
  message?: string;
  user?: {
    kakaoId: string;
    email?: string;
    nickname?: string;
    phone?: string;
    address?: string;
  }; // ✅ 추가
}

export default function OrderForm({
  products,
  totalAmount,
  isVerified,
  isMember,
  phoneRest = "",
  setPhoneRest,
  code = "",
  setCode,
  handleSendCode,
  handleVerifyCode,
  message = "",
  user, // ✅ 이 줄 추가해야 함
}: OrderFormProps) {
  const FREE_SHIPPING_THRESHOLD = 50000;
  const DELIVERY_FEE = 3500;

  const [shippingFee, setShippingFee] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  const [couponCode, setCouponCode] = useState("BETA25MAY");

  const [recipient, setRecipient] = useState("");
  const [zip, setZip] = useState("");
  const [addr, setAddr] = useState("");
  const [detail, setDetail] = useState("");
  const [memo, setMemo] = useState("부재 시 문 앞에 놓아주세요.");
  const [customMemo, setCustomMemo] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
  // const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState(false);

  const fullPhone = `010${phoneRest}`;

  // ✅ 유저 주소 저장
const saveUserAddress = async () => {
  try {
    await fetch("/api/update-user-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: `${zip} ${addr} ${detail}` }),
    });
  } catch (err) {
    console.error("❌ 주소 저장 실패:", err);
  }
};

  useEffect(() => {
    const loadWidget = async () => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const customerKey = `customer_${Date.now()}`;
      const widget = await loadPaymentWidget(clientKey, customerKey);
  
      await widget.renderPaymentMethods("#payment-widget", {
        value: totalAmount,
      });
  
      setPaymentWidget(widget);
    };
  
    loadWidget();
  }, [totalAmount]);
  

  // ✅ "회원이면 기존 전화번호/주소 자동 입력"
// OrderForm.tsx 내 useEffect
useEffect(() => {
  const fetchUserInfo = async () => {
    if (!isMember) return;

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.phone && setPhoneRest) {
        const match = data.phone.replace(/[\s\-\+]/g, "").match(/10(\d{8})$/);
        if (match) setPhoneRest(match[1]);  // 예: "54709225"
      }
      

      if (data.address) {
        const [zipCode, ...rest] = data.address.split(" ");
        setZip(zipCode);
        setAddr(rest.slice(0, -1).join(" "));
        setDetail(rest.at(-1) ?? "");
      }
    } catch (error) {
      console.warn("회원 정보 자동입력 실패", error);
    }
  };

  fetchUserInfo();
}, [isMember, setPhoneRest]);


  useEffect(() => {
    let fee = totalAmount < FREE_SHIPPING_THRESHOLD ? DELIVERY_FEE : 0;
    let discount = 0;

    if (couponCode === "BETA25MAY") {
      fee = 0;
    } else if (couponCode === "BETA20DISCOUNT") {
      discount = Math.floor(totalAmount * 0.2);
    }

    setShippingFee(fee);
    setDiscountAmount(discount);
    setFinalAmount(totalAmount + fee - discount);
  }, [totalAmount, couponCode]);

  const handleDaumPostcode = () => {
    if (window.daum?.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data) {
          setZip(data.zonecode);
          setAddr(data.roadAddress);
        },
      }).open();
    } else {
      setSubmitMessage("주소 API 로딩이 아직 완료되지 않았어요.");
    }
  };

  const handleClick = useCallback(async () => {
    if (!paymentWidget || finalAmount <= 0 || !recipient || !addr || !detail || (!isVerified && !isMember)) {
      setSubmitMessage("필수 정보를 모두 입력해주세요.");
      return;
    }
  
    const orderId = `order-${Date.now()}`;
    const successUrl = `${window.location.origin}/order-complete?orderId=${orderId}`;
    const failUrl = `${window.location.origin}/order-fail`;
  
  // ✅ 회원이고 주소 저장 필요하면 저장
  if (isMember && addr && detail) {
    await saveUserAddress();
  }
    const { error } = await supabase.from("orders").insert({
      order_id: orderId,
      products,
      total_amount: totalAmount,
      phone: fullPhone,
      address: `${zip} ${addr} ${detail}`,
      recipient,
      memo: memo === "직접 입력" ? customMemo : memo,
      verified: true,
      status: "결제대기",
      delivery_fee: shippingFee > 0 ? 1 : 0,
      coupon_code: couponCode,
      discount_amount: discountAmount,
      kakao_id: isMember && user?.kakaoId ? user.kakaoId : null, // ✅ 이렇게 처리
    });
  
    if (error) {
      console.error("❌ 주문 저장 실패:", error.message);
      setSubmitMessage("주문 저장 중 오류가 발생했습니다.");
      return;
    }
  
    try {
      await paymentWidget.requestPayment({
        orderId,
        orderName: products.map((p) => p.order_name).join(", "),
        customerName: recipient,
        customerEmail: "none@ippiego.shop",
        successUrl,
        failUrl,
      });
    } catch (error) {
      console.error("❌ 결제 요청 실패", error);
      setSubmitMessage("결제 요청 중 문제가 발생했습니다.");
    }
  }, [
    paymentWidget,
    finalAmount,
    recipient,
    addr,
    detail,
    isVerified,
    isMember,
    products,
    totalAmount,
    fullPhone,
    zip,
    memo,
    customMemo,
    shippingFee,
    couponCode,
    discountAmount,
  ]);
  
  

  return (
    <div className="space-y-6">

      {/* 전화번호 입력 영역 */}
      <div className="space-y-2">
        <label className="block text-[15px] font-semibold text-gray-900">
          휴대전화 번호 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value="010"
            readOnly
            className="w-[70px] px-3 py-2 bg-gray-100 text-center rounded border border-gray-300 text-[15px]"
          />
          {setPhoneRest && (
            <input
              type="text"
              value={phoneRest}
              maxLength={8}
              onChange={(e) => setPhoneRest(e.target.value.replace(/[^0-9]/g, ""))}
              className="flex-1 min-w-[180px] px-3 py-2 rounded border border-gray-300 text-[15px]"
              placeholder="12345678"
            />
          )}
        </div>

        {!isMember && (
          <>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode && setCode(e.target.value)}
              placeholder="인증번호 입력"
              className="w-full px-3 py-2 rounded border border-gray-300 text-[15px]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleSendCode} className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100">
                인증요청
              </button>
              <button onClick={handleVerifyCode} className="px-3 py-2 rounded bg-black text-white text-sm hover:bg-gray-800">
                인증확인
              </button>
            </div>
            {message && <p className="text-sm text-red-600">{message}</p>}
          </>
        )}
      </div>

      {/* 받는 사람 */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-900 mb-2">받는 사람 <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border border-gray-300 px-4 py-2 w-full rounded text-[15px]"
          placeholder="이름 입력"
        />
      </div>

      {/* 주소 입력 */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-900 mb-2">주소 <span className="text-red-500">*</span></label>
        <div className="flex gap-2 mb-2">
          <input type="text" value={zip} readOnly className="border px-3 py-2 rounded w-1/2 bg-gray-100 text-center" placeholder="우편번호" />
          <button onClick={handleDaumPostcode} className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-100 text-sm">
            주소검색
          </button>
        </div>
        <input type="text" value={addr} readOnly className="border px-3 py-2 w-full rounded bg-gray-100 mb-2" placeholder="도로명 주소" />
        <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} className="border px-3 py-2 w-full rounded" placeholder="상세 주소 입력" />
      </div>

      {/* 배송 메모 */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-900 mb-2">배송 메모</label>
        <select value={memo} onChange={(e) => setMemo(e.target.value)} className="border border-gray-300 px-3 py-2 w-full rounded">
          <option>부재 시 문 앞에 놓아주세요.</option>
          <option>경비실에 맡겨주세요.</option>
          <option>배송 전 연락주세요.</option>
          <option>직접 입력</option>
        </select>
        {memo === "직접 입력" && (
          <input type="text" value={customMemo} onChange={(e) => setCustomMemo(e.target.value)} className="mt-2 border px-3 py-2 w-full rounded" placeholder="배송 메모를 입력하세요" />
        )}
      </div>

      {/* 쿠폰 입력 */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-900 mb-2">쿠폰 코드</label>
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="border px-3 py-2 w-full rounded text-[15px]"
          placeholder="쿠폰 코드를 입력하세요"
        />
      </div>

      {/* 주문 상품 리스트 */}
      <div className="border-t pt-5 pb-6 text-sm text-gray-800 space-y-2">
        <h2 className="text-[15px] font-semibold text-black">주문상품</h2>
        {products.map((product) => (
          <div key={product.product_id} className="flex gap-3 items-center">
            <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 relative">
              <Image src={`/products/${product.product_id}/main.jpg`} alt={product.order_name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{product.order_name}</div>
              <div className="text-[15px] font-semibold text-black mt-1">₩{product.amount.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 결제정보 */}
      <div className="border-t pt-5 pb-3 space-y-1 text-sm text-gray-800">
        <h2 className="text-[15px] font-semibold text-black">결제정보</h2>
        <div className="flex justify-between"><span>주문상품</span><span className="font-medium">₩{totalAmount.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>배송비</span><span className="font-medium">+₩{shippingFee.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>할인/부가결제</span><span className="font-medium text-red-500">-₩{discountAmount.toLocaleString()}</span></div>
      </div>

      <div className="bg-blue-50 px-4 py-3 rounded text-right mt-4">
        <span className="text-[16px] font-bold text-blue-600">최종 결제 금액 ₩{finalAmount.toLocaleString()}</span>
      </div>

      {/* ✅ Toss 결제수단 위젯 영역 */}
      <div id="payment-widget" className="my-6" />

      {/* ✅ 결제 버튼 */}
      <button
        onClick={handleClick}
        disabled={
          !paymentWidget ||
          !recipient ||
          !addr ||
          !detail ||
          (!isVerified && !isMember)
        }
        
        className={`w-full py-3 mt-4 rounded text-white text-[15px] font-medium transition ${
          paymentWidget && recipient && addr && detail
            ? "bg-black hover:bg-gray-800"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        결제하기
      </button>


      {submitMessage && <p className="text-sm text-red-600 text-center mt-4">{submitMessage}</p>}

      {/* 다음 주소 검색 스크립트 */}
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" />
    </div>
  );
}

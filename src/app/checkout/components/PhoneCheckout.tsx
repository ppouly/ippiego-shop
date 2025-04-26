"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import OrderForm from "./OrderForm";

export default function PhoneCheckout() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;
  const orderName = searchParams.get("orderName") || "Ippie 상품 결제";
  const productId = searchParams.get("productId") || "unknown";
  const productImage = `/products/${productId}/main.jpg`;

  const [phoneRest, setPhoneRest] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");

  const fullPhone = `010${phoneRest}`;

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
    if (result.success) {
      setIsVerified(true);
      setMessage("인증 성공!");
    } else {
      setMessage("인증 실패: " + result.message);
    }
  };

  return (
    <OrderForm
      isMember={false}
      isVerified={isVerified}
      phoneRest={phoneRest}
      setPhoneRest={setPhoneRest}
      code={code}
      setCode={setCode}
      handleSendCode={handleSendCode}
      handleVerifyCode={handleVerifyCode}
      message={message}
      amount={amount}
      orderName={orderName}
      productId={productId}
      productImage={productImage}
    />
  );
}



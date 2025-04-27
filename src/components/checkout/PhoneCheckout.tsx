"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderForm from "./OrderForm";

interface TempOrder {
  products: {
    product_id: number;
    order_name: string;
    amount: number;
  }[];
  total_amount: number;
}

export default function PhoneCheckout() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<TempOrder | null>(null);
  const [phoneRest, setPhoneRest] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");

  const fullPhone = `010${phoneRest}`;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const res = await fetch(`/api/get-temp-order?orderId=${orderId}`);
        const result = await res.json();
        if (result.success) {
          let products = result.order.products;
          if (typeof products === "string") {
            products = JSON.parse(products);
          }
          setOrder({
            products: result.order.products,
            total_amount: result.order.total_amount,
          });
        } else {
          console.error("주문 정보 조회 실패:", result.message);
        }
      } catch (error) {
        console.error("주문 정보 요청 실패:", error);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    console.log("✅ isVerified 변경됨:", isVerified);
    console.log("✅ phoneRest:", phoneRest);
    console.log("✅ order:", order);
  }, [isVerified, phoneRest, order]);

  const handleSendCode = async () => {
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage("인증번호가 발송되었습니다.");
      // alert(`[입히고test] 인증번호는 ${result.code} 입니다.`);////(6/6 test용)
      } else {
        setMessage(`인증번호 요청 실패: ${result.message || ""}`);
      }
    } catch (error) {
      console.error("인증번호 전송 실패:", error);
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    try {
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
        setMessage(`인증 실패: ${result.message}`);
      }
    } catch (error) {
      console.error("인증 실패:", error);
      setMessage("서버 오류가 발생했습니다.");
    }
  };

  if (!order) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">주문 정보를 불러오는 중...</h2>
      </div>
    );
  }

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
      products={order.products}
      totalAmount={order.total_amount}
    />
  );
}

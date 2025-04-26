"use client";

import { useState } from "react";
import PhoneCheckout from "./components/PhoneCheckout";
import MemberCheckout from "./components/MemberCheckout";

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState<"phone" | "member">("phone");

  return (
    <div className="p-4 space-y-6 text-[15px] text-gray-800">
      <h1 className="text-lg font-semibold text-gray-900">주문서 작성</h1>

      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("phone")}
          className={`flex-1 py-2 ${activeTab === "phone" ? "border-b-2 border-black font-bold" : "text-gray-400"}`}
        >
          비회원 주문
        </button>
        <button
          onClick={() => setActiveTab("member")}
          className={`flex-1 py-2 ${activeTab === "member" ? "border-b-2 border-black font-bold" : "text-gray-400"}`}
        >
          회원 주문
        </button>
      </div>

      {activeTab === "phone" ? <PhoneCheckout /> : <MemberCheckout />}
    </div>
  );
}

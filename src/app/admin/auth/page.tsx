"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ALLOWED_IPS = [
  "119.194.232.192",
  "223.38.51.101",
  "103.243.200.61",
  "211.235.81.50",
  "223.38.48.120",
  "223.38.46.168",
];

export default function AdminAuthPage() {
  const [auth, setAuth] = useState(false);
  const [clientIP, setClientIP] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [ipChecked, setIpChecked] = useState(false); // ✅ IP 확인 완료 여부

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setClientIP(data.ip);

        if (ALLOWED_IPS.includes(data.ip)) {
          // ✅ IP가 허용 IP라면 바로 인증 처리
          localStorage.setItem("admin_auth", "true");
          setAuth(true);
        }
        setIpChecked(true); // ✅ IP 확인 완료
      } catch (err) {
        console.error("IP 조회 실패:", err);
        setIpChecked(true); // ✅ 실패해도 계속
      }
    };
    fetchIP();
  }, []);

  const handlePasswordSubmit = () => {
    if (password === "221124") {
      localStorage.setItem("admin_auth", "true");
      setAuth(true);
      setPasswordError("");
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다.");
    }
  };

  // ✅ 아직 IP 확인 중이라면
  if (!ipChecked) {
    return (
      <div className="p-4 text-center">
        <p>IP 확인 중...</p>
      </div>
    );
  }

  // ✅ 인증 성공 시 관리자 메뉴 보여주기
  if (auth || localStorage.getItem("admin_auth") === "true") {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-lg font-semibold">인증되었습니다. 관리자 메뉴로 이동하세요.</p>
        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <Link href="/admin/orders" className="bg-blue-500 text-white px-3 py-2 rounded">
            주문 관리
          </Link>
          <Link href="/admin/products" className="bg-green-500 text-white px-3 py-2 rounded">
            상품 관리
          </Link>
          <Link href="/admin/statistics" className="bg-purple-500 text-white px-3 py-2 rounded">
            통계 관리
          </Link>
        </div>
      </div>
    );
  }

  // ✅ 허용 IP가 아니면 비밀번호 인증 화면
  return (
    <div className="p-4 text-center">
      <p className="text-gray-500 mb-4">
        관리자 접근을 위한 인증이 필요합니다. (IP: {clientIP})
      </p>
      <div className="mb-2">
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-2 py-1"
        />
      </div>
      {passwordError && <p className="text-red-500">{passwordError}</p>}
      <button
        onClick={handlePasswordSubmit}
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
      >
        확인
      </button>
    </div>
  );
}

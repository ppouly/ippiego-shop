"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// ✅ 공통 제외 IP 목록
const EXCLUDED_IPS = [
  "119.194.232.192",
  "223.38.51.101",
  "::1",
  "103.243.200.61",
  "211.235.81.50",
  "223.38.48.120",
  "223.38.46.168",
];

// ✅ 공통 like 제외 조건 (여기서는 패턴으로 직접 필터)
const EXCLUDED_IP_LIKE_PREFIX = "223.38.";
const EXCLUDED_IP_CONTAINS = "123345";

export default function AdminStatisticsPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (isAuth !== "true") {
      router.push("/admin/auth");
    }
  }, [router]);

  const [date, setDate] = useState(() => {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split("T")[0];
  });

  const [stats, setStats] = useState({
    visitors: 0,
    productViews: 0,
    productViewUsers: 0,
    cartUsers: 0,
    orderClicks: 0,
    sameProductOrders: 0,
    pendingPayments: 0,
    paymentsCompleted: 0,
  });

  // ✅ KST → UTC 변환 함수
  const toUTCISOString = (dateStr: string, hour: number, minute: number, second: number): string => {
    const kstDate = new Date(
      `${dateStr}T${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:${second.toString().padStart(2, "0")}+09:00`
    );
    return kstDate.toISOString();
  };

  // ✅ 공통 IP 필터 함수
  const isExcludedIP = (ip: string | undefined): boolean => {
    if (!ip) return false;
    if (EXCLUDED_IPS.includes(ip)) return true;
    if (ip.startsWith(EXCLUDED_IP_LIKE_PREFIX)) return true;
    if (ip.includes(EXCLUDED_IP_CONTAINS)) return true;
    return false;
  };

  // ✅ fetchStats를 useCallback으로 감싸기
  const fetchStats = useCallback(async () => {
    const startUTC = toUTCISOString(date, 0, 0, 0);
    const endUTC = toUTCISOString(date, 23, 59, 59);

    // (1) 방문자수
    const { data: visitorsData } = await supabase
      .from("page_views")
      .select("ip_address")
      .gte("timestamp", startUTC)
      .lte("timestamp", endUTC);

    const filteredVisitors = visitorsData?.filter((v) => !isExcludedIP(v.ip_address)) || [];
    const uniqueVisitors = new Set(filteredVisitors.map((v) => v.ip_address)).size;

    // (2) 상품뷰
    const { data: productViewsData } = await supabase
      .from("page_views")
      .select("ip_address, path")
      .gte("timestamp", startUTC)
      .lte("timestamp", endUTC)
      .like("path", "%products%");

    const validProductViews = productViewsData?.filter((v) => {
      const ip = v.ip_address || "";
      const path = v.path || "";
      return (
        !isExcludedIP(ip) &&
        path !== "/products" &&
        !path.includes("/products/36") &&
        path.includes("/products")
      );
    }) || [];

    const productViewUsers = new Set(validProductViews.map((v) => v.ip_address)).size;

    // (3) 장바구니 클릭
    const { data: cartUsersData } = await supabase
      .from("cart_logs")
      .select("ip_address")
      .gte("timestamp", startUTC)
      .lte("timestamp", endUTC);

    const filteredCartUsers = cartUsersData?.filter((v) => !isExcludedIP(v.ip_address)) || [];
    const uniqueCartUsers = new Set(filteredCartUsers.map((v) => v.ip_address)).size;

    // (4) 주문하기 클릭
    const { data: orderClicks } = await supabase
      .from("orders")
      .select("products")
      .eq("status", "temp")
      .gte("created_at", startUTC)
      .lte("created_at", endUTC);

    const sameProductOrders = new Set(orderClicks?.map((o) => o.products)).size;

    // (5) 결제대기
    const { count: pendingPayments } = await supabase
      .from("orders")
      .select("id", { count: "exact" })
      .eq("status", "결제대기")
      .gte("created_at", startUTC)
      .lte("created_at", endUTC);

    // (6) 결제완료
    const { count: paymentsCompleted } = await supabase
      .from("orders")
      .select("id", { count: "exact" })
      .eq("status", "결제완료")
      .gte("created_at", startUTC)
      .lte("created_at", endUTC);

    setStats({
      visitors: uniqueVisitors,
      productViews: validProductViews.length,
      productViewUsers,
      cartUsers: uniqueCartUsers,
      orderClicks: orderClicks?.length || 0,
      sameProductOrders,
      pendingPayments: pendingPayments || 0,
      paymentsCompleted: paymentsCompleted || 0,
    });
  }, [date]); // ✅ date만 의존성으로!

  // ✅ useEffect에서 안전하게 fetchStats 사용
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ✅ 비율 계산
  const productUserRatio = stats.visitors
    ? ((stats.productViewUsers / stats.visitors) * 100).toFixed(1) + "%"
    : "-";
  const avgProductClick = stats.productViewUsers
    ? (stats.productViews / stats.productViewUsers).toFixed(1)
    : "-";
  const cartUserRatio = stats.productViewUsers
    ? ((stats.cartUsers / stats.productViewUsers) * 100).toFixed(1) + "%"
    : "-";
  const orderUserRatio = stats.productViewUsers
    ? ((stats.orderClicks / stats.productViewUsers) * 100).toFixed(1) + "%"
    : "-";
  const purchaseConversion = stats.productViewUsers
    ? ((stats.paymentsCompleted / stats.productViewUsers) * 100).toFixed(1) + "%"
    : "-";

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">일별 통계 (KST 기준)</h1>

      <div className="mb-4">
        <label className="mr-2">날짜 선택:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-2 py-1"
        />
      </div>

      <table className="table-auto w-full border text-sm">
        <thead>
            <tr className="bg-gray-100">
            <th className="border px-2 py-1">항목</th>
            <th className="border px-2 py-1">값</th>
            </tr>
        </thead>
        <tbody>
            <tr><td className="border px-2 py-1">방문자수</td><td className="border px-2 py-1">{stats.visitors}</td></tr>
            <tr><td className="border px-2 py-1">상품뷰</td><td className="border px-2 py-1">{stats.productViews}</td></tr>
            <tr><td className="border px-2 py-1">순 상품뷰 이용자수</td><td className="border px-2 py-1">{stats.productViewUsers}</td></tr>
            <tr><td className="border px-2 py-1">장바구니 클릭 이용자수</td><td className="border px-2 py-1">{stats.cartUsers}</td></tr>
            <tr><td className="border px-2 py-1">주문하기 클릭</td><td className="border px-2 py-1">{stats.orderClicks}</td></tr>
            <tr><td className="border px-2 py-1">동일상품주문</td><td className="border px-2 py-1">{stats.sameProductOrders}</td></tr>
            <tr><td className="border px-2 py-1">결제대기</td><td className="border px-2 py-1">{stats.pendingPayments}</td></tr>
            <tr className="bg-yellow-100 font-semibold">
            <td className="border px-2 py-1">결제완료</td>
            <td className="border px-2 py-1">{stats.paymentsCompleted}</td>
            </tr>
            <tr><td className="border px-2 py-1">상품본 이용자 비중</td><td className="border px-2 py-1">{productUserRatio}</td></tr>
            <tr><td className="border px-2 py-1">상품본 이용자 인당 평균 클릭</td><td className="border px-2 py-1">{avgProductClick}</td></tr>
            <tr><td className="border px-2 py-1">상품본 이용자 장바구니 비중</td><td className="border px-2 py-1">{cartUserRatio}</td></tr>
            <tr><td className="border px-2 py-1">상품본 이용자 주문하기 비중</td><td className="border px-2 py-1">{orderUserRatio}</td></tr>
            <tr className="bg-green-100 font-semibold">
            <td className="border px-2 py-1">구매전환율</td>
            <td className="border px-2 py-1">{purchaseConversion}</td>
            </tr>
        </tbody>
        </table>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface OrderSummary {
  order_id: string;
  created_at: string;
  total_amount: number;
  delivery_status: string;
  products: {
    amount: number;
    order_name: string;
    product_id: number;
  }[];
}

export default function AdminOrdersPage() {
  const [auth, setAuth] = useState(false);
  const [clientIP, setClientIP] = useState("");

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => {
        const allowlist = ['119.194.232.192','223.38.51.101','::1','103.243.200.61','211.235.81.50','223.38.48.120','223.38.46.168']; // 수정 필요
        setClientIP(data.ip);
        if (allowlist.includes(data.ip)) {
          setAuth(true);
        }
      });
  }, []);

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalMargin, setTotalMargin] = useState<number>(0);
  const [startDate, setStartDate] = useState(() => {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split("T")[0];
  });
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!auth) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("order_id, created_at, total_amount, delivery_status, products")
        .eq("status", "결제완료")
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Supabase 에러:", error.message);
        setErrorMessage("주문 정보를 불러오는 중 오류가 발생했습니다.");
        return;
      }

      if (!data || data.length === 0) {
        console.warn("📭 결제완료 주문 없음");
        setOrders([]);
        return;
      }

      data.forEach((order) => {
        order.created_at = new Date(new Date(order.created_at).getTime() + 9 * 60 * 60 * 1000).toISOString();
      });

      let sales = 0;
      let margin = 0;

      for (const order of data) {
        sales += order.total_amount;

        let productList: OrderSummary["products"] = [];
        try {
          if (Array.isArray(order.products)) {
            productList = order.products;
          } else if (typeof order.products === "string") {
            productList = JSON.parse(order.products);
          }
        } catch {
          console.error("🚨 products JSON 파싱 실패:", order.products);
          continue;
        }

        for (const item of productList) {
          const { data: product } = await supabase
            .from("products")
            .select("purchasePrice")
            .eq("id", item.product_id)
            .single();

          if (product) {
            margin += product.purchasePrice;
          }
        }
      }

      setOrders(data);
      setTotalSales(sales);
      setTotalMargin(margin);
    };

    fetchOrders();
  }, [auth, startDate, endDate]);

  if (!auth) {
    return <div className="p-4 text-center text-gray-500">허용되지 않은 접근입니다. (IP: {clientIP})</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">결제완료 내역</h1>

      <div className="mb-4">
        <label className="mr-2">시작일:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-2 py-1 mr-4"
        />
        <label className="mr-2">종료일:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-2 py-1"
        />
      </div>

      {errorMessage ? (
        <p className="text-red-500 mb-4">{errorMessage}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center mt-8">결제완료된 주문이 없습니다.</p>
      ) : (
        <>
          <table className="table-auto w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">결제일</th>
                <th className="border px-2 py-1">결제금액</th>
                <th className="border px-2 py-1">마진</th>
                <th className="border px-2 py-1">배송상태</th>
                <th className="border px-2 py-1">상세보기</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  
                  <td className="border px-2 py-1">
                  {format(new Date(new Date(order.created_at).getTime() + 9 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm")}
                  </td>
                  <td className="border px-2 py-1">₩{order.total_amount.toLocaleString()}</td>
                  <td className="border px-2 py-1">(개별 계산)</td>
                  <td className="border px-2 py-1">{order.delivery_status}</td>
                  <td className="border px-2 py-1 text-blue-600 underline">
                    <Link href={`/admin/orders/${order.order_id}`}>보기</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-right">
            <p>총 결제금액: ₩{totalSales.toLocaleString()}</p>
            <p>총 마진: ₩{totalMargin.toLocaleString()}</p>
          </div>
        </>
      )}
    </div>
  );
}

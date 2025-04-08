// src/app/orders/page.tsx

"use client";

import { useEffect, useState } from "react";

type Order = {
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  address: string;
  date: string;
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("orders");
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-gray-800 text-xl font-bold mb-4">주문 내역</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">주문한 내역이 없습니다.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="mb-6 border-b pb-4">
            <p className="text-sm text-gray-500 mb-1">
              📅 {order.date}
            </p>
            <p className="text-gray-800 text-sm mb-2">📦 배송지: {order.address}</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="text-gray-600 pl-2 text-sm">
                - {item.name} x {item.quantity}개 (₩
                {(item.price * item.quantity).toLocaleString()})
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

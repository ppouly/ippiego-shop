"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import copy from "copy-to-clipboard";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [reviewLinks, setReviewLinks] = useState<string[]>([]);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState("");

  useEffect(() => {
    if (!orderId) {
      console.error("❌ orderId가 없습니다.");
      return;
    }

    const fetchOrderDetail = async () => {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error) {
        console.error("❌ 주문 조회 에러:", error.message);
        return;
      }

      if (!orderData) {
        console.warn("🚫 해당 order_id의 주문이 존재하지 않습니다.");
        return;
      }

      setOrder(orderData);
      setNewDeliveryStatus(orderData.delivery_status);

      let productList: { product_id: number; order_name: string; amount: number }[] = [];
      try {
        productList = Array.isArray(orderData.products)
          ? orderData.products
          : typeof orderData.products === "string"
          ? JSON.parse(orderData.products)
          : [];
      } catch (e) {
        console.error("🚨 products JSON 파싱 실패:", orderData.products);
        return;
      }

      const details: any[] = [];
      const links: string[] = [];

      for (const item of productList) {
        const { data: product } = await supabase
          .from("products")
          .select("name, purchasePrice")
          .eq("id", item.product_id)
          .single();

        if (product) {
          details.push({ ...product, quantity: 1, ...item });

          const { data: tokenData } = await supabase
            .from("reviews_tokens")
            .select("token")
            .eq("order_id", orderId)
            .eq("product_id", item.product_id)
            .maybeSingle();

          if (tokenData?.token) {
            links.push(`http://ippiego.shop/review-write?token=${tokenData.token}`);
          }
        }
      }

      setProductDetails(details);
      setReviewLinks(links);
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    const valueToSave = newDeliveryStatus === "" ? null : newDeliveryStatus;
    const { error } = await supabase
      .from("orders")
      .update({ delivery_status: valueToSave })
      .eq("order_id", orderId);
  
    if (error) {
      alert("업데이트 중 오류가 발생했습니다: " + error.message);
    } else {
      alert("배송상태가 업데이트되었습니다.");
      location.reload();
    }
  };
  

  if (!orderId) return <div className="p-4 text-red-500">orderId 없음</div>;
  if (!order) return <div className="p-4">주문을 불러오는 중입니다...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">주문 상세 정보</h2>

      <div className="mb-4">
        <h3 className="font-semibold">기본 정보</h3>
        <table className="table-auto text-sm border border-collapse">
  <tbody>
    {Object.entries(order).map(([key, value]) => (
      <tr key={key}>
        <td className="border px-2 py-1 font-medium whitespace-nowrap bg-gray-100">
          <div className="flex items-center gap-2">
            <span>{key}</span>
            {(key === "phone" || key === "address" || key === "memo" || key === "recipient") && order[key] && (
              <button
                onClick={() => copy(String(order[key]))}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                복사
              </button>
            )}
          </div>
        </td>
        <td className="border px-2 py-1">
          {value === null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value)}
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">주문 상품</h3>
        <ul className="list-disc list-inside">
          {productDetails.map((p, i) => (
            <li key={i}>
              {p.name} × 1 (매입가 ₩{p.purchasePrice}) - 주문명: {p.order_name}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
  <h3 className="font-semibold">배송상태 변경</h3>
  <div className="flex items-center gap-2 mb-2">
    <select
      value={newDeliveryStatus ?? ""}
      onChange={(e) => {
        const selected = e.target.value;
        if (selected === "NULL") {
          setNewDeliveryStatus("");
        } else if (selected === "배송 진행 중") {
          const tracking = prompt("운송장 번호를 입력해주세요");
          if (tracking) {
            setNewDeliveryStatus(`배송 진행 중(운송장번호: ${tracking})`);
          }
        } else if (selected === "배송 완료") {
          const prev = newDeliveryStatus;
          const match = prev?.match(/운송장번호: (.*?)\)?$/);
          const tracking = match?.[1];
          if (tracking) {
            setNewDeliveryStatus(`배송완료(운송장번호: ${tracking})`);
          } else {
            alert("먼저 '배송 진행 중' 상태에서 운송장번호를 입력해주세요.");
          }
        } else {
          setNewDeliveryStatus(selected);
        }
      }}
      className="border px-2 py-1"
    >
      <option value="">선택</option>
      <option value="환불완료">환불완료</option>
      <option value="배송준비">배송준비</option>
      <option value="배송 진행 중">배송 진행 중</option>
      <option value="배송 완료">배송 완료</option>
      <option value="NULL">(값 비우기)</option>
    </select>
    <button
      onClick={handleStatusUpdate}
      className="bg-blue-600 text-white px-3 py-1 rounded"
    >
      저장
    </button>
  </div>
  <p className="text-sm text-gray-500">현재 상태: {newDeliveryStatus ?? "(없음)"}</p>
</div>

      <div className="mb-4">
        <h3 className="font-semibold">리뷰 작성 링크</h3>
        {reviewLinks.map((link, i) => (
          <div key={i} className="flex flex-col gap-1 mb-3">
            <div className="text-sm font-medium text-gray-700">
              🔗 상품 ID: {productDetails[i]?.product_id}, 이름: {productDetails[i]?.name}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={link}
                readOnly
                className="border px-2 py-1 w-full"
              />
              <button
                onClick={() => copy(link)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 active:scale-95 transition-transform"
              >
                링크 복사
              </button>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
              >
                링크 열기
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

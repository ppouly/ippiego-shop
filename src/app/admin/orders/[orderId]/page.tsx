"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import copy from "copy-to-clipboard";
import { useRouter } from "next/navigation"

interface ProductItem {
  product_id: number;
  order_name: string;
  amount: number;
}

interface ProductDetail extends ProductItem {
  name: string;
  purchasePrice: number;
  quantity: number;
}

interface Order {
  [key: string]: unknown;
  order_id: string;
  delivery_status: string | null;
  products: ProductItem[] | string;
}


export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [reviewLinks, setReviewLinks] = useState<string[]>([]);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<string>("");
  const [reviewUrl, setReviewUrl] = useState("https://buly.kr/9XLCeG1"); // ✅ 여기에 선언
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (isAuth !== "true") {
      router.push("/admin/auth");
    }
  }, [router]);

  useEffect(() => {

    if (!orderId) return;

    const fetchOrderDetail = async () => {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error || !orderData) {
        console.error("❌ 주문 조회 실패", error?.message);
        return;
      }

      setOrder(orderData);
      setNewDeliveryStatus(orderData.delivery_status ?? "");

      let productList: ProductItem[] = [];

      try {
        if (Array.isArray(orderData.products)) {
          productList = orderData.products;
        } else if (typeof orderData.products === "string") {
          productList = JSON.parse(orderData.products);
        }
      } catch {
        console.error("🚨 products JSON 파싱 실패:", orderData.products);
        return;
      }

      const details: ProductDetail[] = [];
      const links: string[] = [];

      for (const item of productList) {
        const { data: product } = await supabase
          .from("products")
          .select("name, purchasePrice")
          .eq("id", item.product_id)
          .single();

        if (product) {
          details.push({
            ...item,
            name: product.name,
            purchasePrice: product.purchasePrice,
            quantity: 1,
          });

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
  
    const updateFields: { delivery_status: string | null; delivery_complete_date?: string } = {
      delivery_status: valueToSave,
    };
  
    if (valueToSave?.includes("배송완료")) {
      updateFields.delivery_complete_date = new Date().toISOString(); // ✅ 현재 시각 추가
    }
  
    const { error } = await supabase
      .from("orders")
      .update(updateFields)
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
            {(Object.entries(order) as [string, unknown][]).map(([key, value]) => {
                const isCopyable = ["phone", "address", "memo", "recipient"].includes(key);

                return (
                <tr key={key}>
                    <td className="border px-2 py-1 font-medium whitespace-nowrap bg-gray-100">
                    <div className="flex items-center gap-2">
                        <span>{key}</span>
                        {isCopyable && value !== null && value !== undefined && (
                        <button
                            onClick={() => copy(String(value))}
                            className="text-xs text-blue-600 underline hover:text-blue-800"
                        >
                            복사
                        </button>
                        )}
                    </div>
                    </td>
                    <td className="border px-2 py-1">
                    {value === null || value === undefined
                        ? ""
                        : typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </td>
                </tr>
                );
            })}
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
                const match = newDeliveryStatus?.match(/운송장번호: (.*?)\)?$/);
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
        <div className="mt-6">
        <h3 className="font-semibold">배송안내 고객번호</h3>
        {(() => {
            const phone = typeof order?.phone === "string" ? order.phone.replace(/^0/, "") : "";
            const finalCode = phone ? `*28182${phone}` : "";

            return (
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-800">
                {finalCode || "(전화번호가 없습니다)"}
                </span>
                {finalCode && (
                <button
                    onClick={() => copy(finalCode)}
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                    복사
                </button>
                )}
            </div>
            );
        })()}
        </div>
        <div className="mt-6">
        <h3 className="font-semibold">배송안내 메세지</h3>
        {(() => {
            const match = newDeliveryStatus?.match(/운송장번호: (.*?)\)?$/);
            const trackingNumber = match?.[1];

            if (newDeliveryStatus?.includes("배송 진행 중") && trackingNumber) {
            const message = `[입히고] 배송이 시작되었어요! CUpost 운송장번호 ${trackingNumber} 주문내역은 마이페이지에서 확인하실 수 있어요.`;

            return (
                <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-800">{message}</span>
                <button
                    onClick={() => copy(message)}
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                    복사
                </button>
                </div>
            );
            }

            if (newDeliveryStatus?.includes("배송완료")) {
            const completeMessage = `[입히고]배송완료! 사진후기로 응원주세요🌱\n👉리뷰\n${reviewUrl}\n👉환불\n마이페이지>주문내역`;

            return (
                <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                    <input
                    type="text"
                    value={reviewUrl}
                    onChange={(e) => setReviewUrl(e.target.value)}
                    className="border px-2 py-1 text-sm w-full"
                    />
                    <button
                    onClick={() => copy(completeMessage)}
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                    >
                    복사
                    </button>
                </div>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{completeMessage}</pre>
                </div>
            );
            }

            return <p className="text-sm text-gray-500">&#39;배송 진행 중&#39; 또는 &#39;배송완료&#39; 상태일 때 표시됩니다.</p>;
        })()}
        </div>


      
    </div>
  );
}

import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid"; // uuid 설치 필요: npm install uuid

export async function POST(req: Request) {
  const { productId, amount } = await req.json();

  const tempOrderId = uuidv4(); // 고유 주문 ID 생성

  const { data, error } = await supabase.from("orders").insert([
    {
      order_id: tempOrderId,
      product_id: productId,
      amount,
      status: "temp", // 임시 상태
    },
  ]).select("*").single();

  if (error) {
    console.error("주문 생성 실패:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, orderId: data.order_id }), { status: 200 });
}

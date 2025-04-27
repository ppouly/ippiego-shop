import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("👉 서버로 받은 body:", body);

  const { products, totalAmount } = body;

  if (
    !products ||
    !Array.isArray(products) ||
    products.length === 0 ||
    products.some(p => p.product_id === undefined || p.product_id === null || isNaN(Number(p.product_id)))
  ) {
    console.log("❌ products가 비어 있거나 이상함:", products);
    return new Response(
      JSON.stringify({ success: false, message: "상품 정보가 없습니다. 다시 선택해주세요." }),
      { status: 400 }
    );
  }

  const tempOrderId = uuidv4();

  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        order_id: tempOrderId,
        products,
        total_amount: totalAmount,
        status: "temp",
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error("❌ 주문 생성 실패:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, orderId: data.order_id }), { status: 200 });
}

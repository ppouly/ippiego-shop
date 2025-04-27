import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return new Response(JSON.stringify({ success: false, message: "orderId가 필요합니다." }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("order_id, products, total_amount, status")
    .eq("order_id", orderId)
    .eq("status", "temp")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("주문 조회 실패:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  if (!data) {
    return new Response(JSON.stringify({ success: false, message: "유효하지 않은 주문입니다." }), { status: 400 });
  }

  // ✅ 여기서 products를 파싱하는 로직 추가!
  if (typeof data.products === "string") {
    try {
      data.products = JSON.parse(data.products);
    } catch (parseError) {
      console.error("products 파싱 실패:", parseError);
      return new Response(JSON.stringify({ success: false, message: "상품 정보 파싱 오류입니다." }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ success: true, order: data }), { status: 200 });
}

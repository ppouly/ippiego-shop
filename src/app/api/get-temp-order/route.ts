import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return new Response(JSON.stringify({ success: false, message: "orderId가 필요합니다." }), { status: 400 });
  }

  const { data, error } = await supabase.from("orders")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) {
    console.error("주문 조회 실패:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, order: data }), { status: 200 });
}

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // ✅ 여기에 supabase 불러오기

export async function POST(req: Request) {
  const { paymentKey, orderId, amount } = await req.json();

  const authHeader = Buffer.from("test_sk_...").toString("base64");

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const result = await tossRes.json();

  if (!tossRes.ok) {
    return NextResponse.json({ ok: false, message: "결제 승인 실패" }, { status: 400 });
  }

  // ✅ 결제 성공했을 때 Supabase에 주문 저장
  const { error } = await supabase.from("orders").insert([
    {
      order_id: result.orderId,
      buyer_name: result.customerName,
      product_name: result.orderName,
      amount: result.totalAmount,
    },
  ]);

  if (error) {
    console.error("Supabase 저장 실패:", error.message);
    return NextResponse.json({ ok: false, message: "DB 저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result });
}

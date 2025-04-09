import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { paymentKey, orderId, amount } = await req.json();

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ ok: false, message: "필수 결제 정보 누락" }, { status: 400 });
  }

  if (!process.env.TOSS_SECRET_KEY) {
    console.error("❌ TOSS_SECRET_KEY 누락");
    return NextResponse.json({ ok: false, message: "서버 설정 오류" }, { status: 500 });
  }

  const authHeader = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount: Number(amount),
    }),
  });

  const result = await tossRes.json();

  if (!tossRes.ok) {
    console.error("❌ Toss 결제창 생성 실패:", tossRes.status, result);
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  // if (!tossRes.ok) {
  //   console.error("❌ 결제 승인 실패:", result);
  //   return NextResponse.json({ ok: false, message: "결제 승인 실패" }, { status: 400 });
  // }

  console.log("✅ 결제 승인 성공:", result);

  const { error } = await supabase.from("orders").insert([
    {
      order_id: result.orderId,
      buyer_name: result.customerName,
      product_name: result.orderName,
      amount: result.totalAmount,
    },
  ]);

  if (error) {
    console.error("❌ Supabase 저장 실패:", error.message, error.details);
    return NextResponse.json({ ok: false, message: "DB 저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result });
}

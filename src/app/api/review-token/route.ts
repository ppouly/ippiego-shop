// /app/api/review-token/route.ts

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { orderId, productId, phone } = body;

  if (!productId) {
    return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews_tokens")
    .insert([
      {
        order_id: orderId,
        product_id: productId,
        phone,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Token 생성 실패:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, token: data.token });
}

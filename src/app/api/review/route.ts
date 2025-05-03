// /app/api/review/route.ts

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, content, rating, nickname } = body;

  if (!token || !content) {
    return NextResponse.json({ success: false, message: "필수 항목 누락" }, { status: 400 });
  }

  // 1. token 유효성 검사 → 해당 product_id 찾기
  const { data: tokenData, error: tokenError } = await supabase
    .from("reviews_tokens")
    .select("product_id")
    .eq("token", token)
    .maybeSingle();

  if (tokenError || !tokenData) {
    return NextResponse.json({ success: false, message: "유효하지 않은 토큰입니다." }, { status: 400 });
  }

  // 2. 후기 저장
  const { error: insertError } = await supabase.from("reviews").insert({
    product_id: tokenData.product_id,
    content,
    rating,
    nickname,
  });

  if (insertError) {
    return NextResponse.json({ success: false, message: "저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

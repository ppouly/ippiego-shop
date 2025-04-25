import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs"; // npm install dayjs (시간계산용)

export async function POST(req: Request) {
  const { phone, code } = await req.json();

  const { data, error } = await supabase
    .from("order_verifications")
    .select("*")
    .eq("phone", phone)
    .eq("code", code)
    .eq("verified", false) // ✅ 이미 인증된 코드 제외
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("DB 조회 실패", error);
    return NextResponse.json({ success: false, message: "서버 오류가 발생했어요." });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, message: "인증번호가 올바르지 않아요." });
  }

  const record = data[0];
  const createdAt = dayjs(record.created_at);
  const now = dayjs();

  if (now.diff(createdAt, "minute") > 5) { // ✅ 5분 초과된 인증코드는 만료
    return NextResponse.json({ success: false, message: "인증번호가 만료되었어요." });
  }

  await supabase
    .from("order_verifications")
    .update({ verified: true })
    .eq("id", record.id);

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { phone, code } = await req.json();

  const { data } = await supabase
    .from("order_verifications")
    .select("*")
    .eq("phone", phone)
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, message: "인증번호가 올바르지 않아요." });
  }

  await supabase
    .from("order_verifications")
    .update({ verified: true })
    .eq("id", data[0].id);

  return NextResponse.json({ success: true });
}

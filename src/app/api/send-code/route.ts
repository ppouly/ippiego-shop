//import { NextResponse } from "next/server";
//import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { phone } = await req.json();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 실제로는 메시지 전송 로직이 여기에 들어가야 함
//   await supabase.from("order_verifications").insert({
//     phone,
//     code,
//     verified: false,
//   });

  console.log(`📨 인증번호 전송됨: ${code} → ${phone}`);
//   return NextResponse.json({ success: true });
return Response.json({ success: true, code }); // ← 테스트용으로 인증번호 반환
}

import { supabase } from "@/lib/supabase";
import coolsms from "coolsms-node-sdk"; // ✅ 그대로 import (1/6)
const messageService = new coolsms(process.env.COOLSMS_API_KEY!, process.env.COOLSMS_API_SECRET!); // ✅ .default 빼기 (2/6)

export async function POST(req: Request) {
  const { phone } = await req.json();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 인증번호 DB 저장
  await supabase.from("order_verifications").insert({
    phone,
    code,
    verified: false,
  });

  try {
    //쿨SMS 발송 (3/6)
    await messageService.sendOne({
      to: phone,
      from: process.env.COOLSMS_SENDER_NUMBER!,
      text: `[입히고] 인증번호는 ${code} 입니다.`,
      autoTypeDetect: true, // ✅ 필수 옵션 추가
    }); //


    console.log(`📨 인증번호 전송 완료: ${code} → ${phone}`);
    // TEST 인증번호를 클라이언트에 돌려보내기
    //return Response.json({ success: true, code }); //(5/6 test용)
    return Response.json({ success: true });  //(4/6)
  } catch (error) {
    console.error("문자 발송 실패", error);
    return Response.json({ success: false, error: "문자 발송 실패" });
  }
}

import { supabase } from "@/lib/supabase";
import coolsms from "coolsms-node-sdk"; // ✅ 그대로 import (1/6)
const messageService = new coolsms(process.env.COOLSMS_API_KEY!, process.env.COOLSMS_API_SECRET!); // ✅ .default 빼기 (2/6)

export async function POST(req: Request) {
  const { phone } = await req.json();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ 인증번호 DB 저장 (실패 시 에러 출력)
  const { error: insertError } = await supabase.from("order_verifications").insert({
    phone,
    code,
    verified: false,
  });

  interface CoolSmsError extends Error {
    response?: {
      status?: number;
      data?: {
        error?: {
          code?: string;
          message?: string;
        };
      };
    };
  }

  if (insertError) {
    console.error("🔥 Supabase DB 저장 실패:", insertError.message || insertError);
    return Response.json({ success: false, error: "DB 저장 실패" });
  }


  try {
    // ✅ 쿨SMS 발송 (실패 시 에러 상세 출력)
    const result = await messageService.sendOne({
      to: phone,
      from: process.env.COOLSMS_SENDER_NUMBER!,
      text: `[입히고] 인증번호는 ${code} 입니다.`,
      autoTypeDetect: true,
    });
    console.log("✅ 쿨SMS 발송 성공:", result);

    console.log(`📨 인증번호 전송 완료: ${code} → ${phone}`);
    // TEST 인증번호를 클라이언트에 돌려보내기
    //return Response.json({ success: true, code }); //(5/6 test용)
    return Response.json({ success: true });  //(4/6)
  } catch (err) {
    const error = err as CoolSmsError;

    console.error("🔥 쿨SMS 발송 실패:", {
      message: error.message,
      response: error.response,
    });

    return Response.json({ success: false, error: error.message || "문자 발송 실패" });
  }
}
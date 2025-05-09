import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { headers as getHeaders } from "next/headers";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    if (!JWT_SECRET) {
      throw new Error("❌ 환경변수 JWT_SECRET이 설정되지 않았습니다.");
    }

    const headers = await getHeaders();
    const cookieHeader = headers.get("cookie") ?? "";
    const parsedCookies = cookie.parse(cookieHeader);
    const sessionToken = parsedCookies.session;

    if (!sessionToken) {
      return NextResponse.json({ error: "세션 없음" }, { status: 401 });
    }

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as { kakaoId: string };
    console.log("🍪 JWT 토큰:", sessionToken);

try {
  const decoded = jwt.verify(sessionToken, JWT_SECRET);
  console.log("✅ 디코드 결과:", decoded);
} catch (err) {
  console.error("❌ JWT 디코딩 실패:", err);
}

    const { data, error } = await supabase
      .from("users")
      .select("phone, address")
      .eq("kakaoId", decoded.kakaoId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "유저 정보 없음" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ 유저 정보 조회 실패:", error);
    return NextResponse.json({ error: "토큰 검증 실패" }, { status: 401 });
  }
}

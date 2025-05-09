import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { headers as getHeaders } from "next/headers";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    // ✅ headers()를 await하여 가져옴 (Next.js의 dynamic API 제한 회피)
    const headers = await getHeaders();
    const cookieHeader = headers.get("cookie") ?? "";

    const parsedCookies = cookie.parse(cookieHeader);
    const sessionToken = parsedCookies.session;

    if (!sessionToken) {
      return NextResponse.json({ error: "세션 없음" }, { status: 401 });
    }

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as { kakaoId: string };

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

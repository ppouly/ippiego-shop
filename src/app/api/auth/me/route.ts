export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase"; // ✅ 기존 클라이언트로 대체

const JWT_SECRET = process.env.JWT_SECRET!;

interface DecodedToken {
  kakaoId: string;
}

export async function GET() {
  try {
    const cookieGetter = cookies as unknown as () => {
      get: (name: string) => { value?: string } | undefined;
    };
    const sessionCookie = cookieGetter().get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "세션 없음" }, { status: 401 });
    }

    const token = sessionCookie.value;
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded.kakaoId) {
      return NextResponse.json({ error: "유효하지 않은 토큰" }, { status: 401 });
    }

    // ✅ Supabase에서 최신 유저 정보 조회
    const { data: userData, error } = await supabase
      .from("users")
      .select("kakaoId, email, nickname, phone, address")
      .eq("kakaoId", decoded.kakaoId)
      .maybeSingle();

    if (error || !userData) {
      console.error("❌ Supabase 유저 조회 실패:", error);
      return NextResponse.json({ error: "유저 정보 조회 실패" }, { status: 500 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("❌ 세션 검증 실패:", error);
    return NextResponse.json({ error: "토큰 검증 실패" }, { status: 401 });
  }
}

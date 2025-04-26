// src/app/api/auth/kakao/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

// Supabase 연결
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    // 1. 카카오 토큰 요청
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
        redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: "카카오 토큰 발급 실패" }, { status: 400 });
    }

    // 2. 사용자 정보 요청
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    const kakaoId = userData.id?.toString();
    const email = userData.kakao_account?.email || null;
    const nickname = userData.properties?.nickname || null;

    // 3. Supabase에 사용자 조회
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("kakao_id", kakaoId)
      .single();

    if (!existingUser) {
      await supabase.from("users").insert([
        { kakao_id: kakaoId, email, nickname },
      ]);
    }

    // 4. JWT 생성
    const token = jwt.sign({ kakaoId, nickname }, JWT_SECRET, { expiresIn: "7d" });

    // 5. 세션 쿠키 설정
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("❌ 로그인 에러:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

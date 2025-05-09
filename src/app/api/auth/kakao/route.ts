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

    // ✅ 여기에 상태 확인 추가
if (!tokenResponse.ok) {
  const errorText = await tokenResponse.text();
  console.error("❌ 카카오 토큰 요청 실패:", tokenResponse.status, errorText);
  return NextResponse.json({ error: "카카오 토큰 요청 실패" }, { status: 400 });
}

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
    const phone = userData.kakao_account?.phone_number || null;       // ✅ 추가
const address = userData.kakao_account?.shipping_address?.base_address || null; // ✅ 추가 

    if (!kakaoId) {
      return NextResponse.json({ error: "카카오 ID를 가져올 수 없습니다." }, { status: 400 });
    }

    // 3. Supabase에 사용자 저장 (중복 대비 upsert)
    await supabase.from("users").upsert(
      { kakao_id: kakaoId, email, nickname,phone,
        address, },
      { onConflict: "kakao_id" }
    );

    // 4. JWT 생성
    const token = jwt.sign({ kakaoId, email, phone, address }, JWT_SECRET, {
      expiresIn: "7d",
    });
    

    // 5. 세션 쿠키 설정 + 사용자 정보 응답
    const response = NextResponse.json({
      success: true,
      user: { kakaoId, nickname, email },
    });

    // ✅ Secure + HttpOnly + SameSite 쿠키 직접 설정
response.headers.set(
  "Set-Cookie",
  `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`
);


    return response;
  } catch (err) {
    console.error("❌ 로그인 서버 오류:", err); // ✅ 이 줄을 추가
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

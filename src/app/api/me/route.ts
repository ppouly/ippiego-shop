export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

interface DecodedToken {
  kakaoId: string;
  email?: string;
  nickname?: string;
  phone?: string;
  address?: string;
}

export async function GET() {
  try {
    // 👇 타입 에러를 완전히 없애는 방법
    const cookieGetter = cookies as unknown as () => { get: (name: string) => { value?: string } | undefined };
    const sessionCookie = cookieGetter().get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "세션 없음" }, { status: 401 });
    }

    const token = sessionCookie.value;
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded.kakaoId) {
      return NextResponse.json({ error: "유효하지 않은 토큰" }, { status: 401 });
    }

    return NextResponse.json({
      kakaoId: decoded.kakaoId,
      email: decoded.email ?? null,
      nickname: decoded.nickname ?? null,
      phone: decoded.phone ?? null,
  address: decoded.address ?? null,
    });
  } catch (error) {
    console.error("❌ 세션 검증 실패:", error);
    return NextResponse.json({ error: "토큰 검증 실패" }, { status: 401 });
  }
}

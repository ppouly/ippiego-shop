import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
interface DecodedToken {
    kakaoId: string;
    email?: string;
    nickname?: string;
  }

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ await 추가
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ user: null });
    }

    const token = sessionCookie.value;


    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded.kakaoId) {
      return NextResponse.json({ user: null });
    }

    const user = {
      kakaoId: decoded.kakaoId,
      email: decoded.email ?? null,
      nickname: decoded.nickname ?? null,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("❌ 세션 검증 실패:", error);
    return NextResponse.json({ user: null });
  }
}

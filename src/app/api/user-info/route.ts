import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // 여긴 클라이언트로도 충분
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

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
    const decoded = jwt.verify(token, JWT_SECRET) as { kakaoId: string };

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

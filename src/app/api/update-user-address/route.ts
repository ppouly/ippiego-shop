import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

// ✅ 쿠키 파서
function parseCookies(req: Request): Record<string, string> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  return Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [name, ...rest] = cookie.split("=");
      return [name, decodeURIComponent(rest.join("="))];
    })
  );
}

export async function POST(req: Request) {
  try {
    const cookies = parseCookies(req);
    const token = cookies["session"];

    if (!token) {
      return NextResponse.json({ error: "세션 없음" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { kakaoId: string };
    const { address, nickname } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "주소 없음" }, { status: 400 });
    }

    const updatePayload: { address: string; nickname?: string } = { address };
    if (nickname) updatePayload.nickname = nickname;

    const { error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("kakao_id", decoded.kakaoId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ 주소/닉네임 업데이트 실패:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET!;

function parseCookies(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  return Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [name, ...rest] = c.split("=");
      return [name, decodeURIComponent(rest.join("="))];
    })
  );
}

export async function GET(req: Request) {
  const cookies = parseCookies(req);
  const token = cookies["session"];

  if (!token) {
    return NextResponse.json({ error: "세션 없음" }, { status: 401 });
  }

  const decoded = jwt.verify(token, JWT_SECRET) as { kakaoId: string };

  const { data, error } = await supabase
    .from("users")
    .select("phone, address")
    .eq("kakao_id", decoded.kakaoId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "유저 정보 없음" }, { status: 404 });
  }

  return NextResponse.json({ success: true, ...data });
}

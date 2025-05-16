import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, timestamp } = body;

  if (!productId) {
    return NextResponse.json({ success: false, error: "Missing productId" }, { status: 400 });
  }

  // IP 주소 가져오기
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // user-agent 가져오기
  const userAgent = req.headers.get("user-agent") || "unknown";

  const { error } = await supabase.from("cart_logs").insert([
    {
      product_id: productId,
      timestamp: timestamp || new Date().toISOString(),
      user_agent: userAgent,
      ip_address: ip,
    },
  ]);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

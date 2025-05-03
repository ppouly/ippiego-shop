import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { path, referrer } = await req.json();

  // 방문자 IP 가져오기 (x-forwarded-for → 배포환경용)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] || "unknown";

  const { error } = await supabase.from("page_views").insert({
    path,
    referrer,
    ip_address: ip,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error("📛 로그 저장 실패:", error);
    return new Response("fail", { status: 500 });
  }

  return new Response("ok");
}

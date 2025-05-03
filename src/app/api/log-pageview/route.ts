import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { path, referrer } = await req.json();

  const { error } = await supabase.from("page_views").insert({
    path,
    referrer,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error("📛 로그 저장 실패:", error);
    return new Response("fail", { status: 500 });
  }

  return new Response("ok");
}

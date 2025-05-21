import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("search") || "";
  const keyword = raw.toLowerCase(); // 공백 제거 X

  console.log("🔍 keyword:", keyword);

  if (!keyword || keyword.length < 1) {
    return new Response(JSON.stringify({ success: false, message: "검색어 없음" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .filter("status", "eq", "판매중") // ✅ 판매중만
    .or(
      `name.ilike.%${keyword}%,brand.ilike.%${keyword}%,category2.ilike.%${keyword}%,brandSize.ilike.%${keyword}%,description.ilike.%${keyword}%`,
      { foreignTable: undefined }
    );

  if (error) {
    console.error("❌ 검색 실패:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }

  console.log("✅ 검색 결과 개수:", data.length);

  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}

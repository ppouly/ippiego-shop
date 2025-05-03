// /app/api/reviews-latest/route.ts

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("reviews")
    .select("content, image_url, nickname, created_at")
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }

  return NextResponse.json({ reviews: data });
}

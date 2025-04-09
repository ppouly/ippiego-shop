// lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // .env에 저장된 Supabase 프로젝트 URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // .env에 저장된 API 키
);

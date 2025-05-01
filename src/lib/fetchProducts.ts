// src/lib/fetchProducts.ts
import { supabase } from "./supabase";
import type { Product } from "@/types/product";

export async function fetchValidProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("status", ["판매중", "판매완료","환불요청"]);

  if (error) {
    console.error("상품 불러오기 오류:", error);
    return [];
  }

  return data || [];
}


// src/lib/fetchProducts.ts 파일 아래에 붙이기
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();

  if (error) {
    console.error("상품 상세 불러오기 오류:", error);
    return null;
  }

  return data;
}

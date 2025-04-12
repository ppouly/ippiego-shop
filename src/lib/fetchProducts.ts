// src/lib/fetchProducts.ts
import { supabase } from "./supabase";
import type { Product } from "@/types/product";

export async function fetchValidProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("status", ["판매중", "판매완료"]);

  if (error) {
    console.error("상품 불러오기 오류:", error);
    return [];
  }

  return data || [];
}

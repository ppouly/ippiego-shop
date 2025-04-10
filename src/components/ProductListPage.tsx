// src/app/products/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  category: string[];
  image: string;
};

export default function ProductListPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*");

      if (category) {
        query = query.contains("category", [category]); // 배열 카테고리 검색
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch error:", error.message);
      } else {
        setProducts(data as Product[]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        {category ? `${category} 카테고리` : "전체 상품"}
      </h1>

      {loading ? (
        <p>불러오는 중...</p>
      ) : products.length === 0 ? (
        <p>상품이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
                <div className="w-full h-[280px] bg-[#F7F2EB] flex items-center justify-center rounded-md overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={280}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                </div>
                <p className="mt-1 text-xs text-[#FF6B6B]">{product.brand}
                <span className="text-xs mt-1 text-[#3F8CFF] ml-2">
                  {product.size}
                </span>
                </p>
                <p className="mt-1 text-sm font-medium text-black">{product.name}</p>
                <p className="text-xs text-gray-400">
                  ₩{product.price.toLocaleString()}
                </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

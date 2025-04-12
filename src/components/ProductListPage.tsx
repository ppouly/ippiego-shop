// src/app/products/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchValidProducts } from "@/lib/fetchProducts"; // ✅ import
import type { Product } from "@/types/product"; // 필요 시 정의 위치에 따라 수정

export default function ProductListPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const allProducts = await fetchValidProducts();

        // ✅ 프론트 필터링: 카테고리와 브랜드
        const filtered = allProducts.filter((p) => {
          const categoryMatch = category ? p.category?.includes(category) : true;
          const brandMatch = brand ? p.brand === brand : true;
          return categoryMatch && brandMatch;
        });

        setProducts(filtered);
      } catch (err) {
        console.error("상품 필터링 실패:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category, brand]);

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
              <p className="mt-1 text-xs text-[#FF6B6B]">
                {product.brand}
                <span className="text-xs mt-1 text-[#3F8CFF] ml-2">
                  {product.size}
                </span>
              </p>
              <p className="mt-1 text-sm font-medium text-black">
                {product.name}
              </p>
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

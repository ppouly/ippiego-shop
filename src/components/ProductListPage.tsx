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
        {products.map((product) => {
          const isSoldOut = product.status === "판매완료";

          return (
        <Link
            href={`/products/${product.id}`}
            key={product.id}
            className={isSoldOut ? "pointer-events-none" : ""}
          >
            <div
              className={`relative w-full h-[280px] ${
                isSoldOut ? "bg-gray-200" : "bg-[#F7F2EB]"
              } flex items-center justify-center rounded-md overflow-hidden`}
            >
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={280}
                className={`object-contain w-full h-full ${
                  isSoldOut ? "opacity-50" : ""
                }`}
                unoptimized
              />
              {isSoldOut && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] font-semibold px-2 py-[2px] rounded-sm">
                  판매완료
                </div>
              )}
            </div>
            <p
              className={`mt-1 text-xs ${
                isSoldOut ? "text-gray-400" : "text-[#FF6B6B]"
              }`}
            >
              {product.brand}
              <span
                className={`text-xs ml-2 ${
                  isSoldOut ? "text-gray-400" : "text-[#3F8CFF]"
                }`}
              >
                {product.size}
              </span>
            </p>
            <p
              className={`mt-1 text-sm font-medium ${
                isSoldOut ? "text-gray-500" : "text-black"
              }`}
            >
              {product.name}
            </p>
            <p className="text-xs text-gray-400">
              ₩{product.price.toLocaleString()}
            </p>
          </Link>
          
          );
        })}

        </div>
      )}
    </div>
  );
}

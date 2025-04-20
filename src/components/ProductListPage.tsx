"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchValidProducts } from "@/lib/fetchProducts";
import type { Product } from "@/types/product";

export default function ProductListPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const size = searchParams.get("size");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const allProducts = await fetchValidProducts();
        const selectedBrands = brand?.split(",") || [];
        const selectedSizes = size?.split(",") || [];

        const filtered = allProducts.filter((p) => {
          const categoryMatch = category ? p.category?.includes(category) : true;
          const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(p.brand) : true;
          const sizeMatch = selectedSizes.length > 0 ? selectedSizes.includes(p.size) : true;
          return categoryMatch && brandMatch && sizeMatch;
        });

        setProducts(filtered);
      } catch (err) {
        console.error("상품 필터링 실패:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category, brand, size]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        {category ? `${category} 카테고리` : "전체 상품"}
      </h1>

    {/* ✅ 필터 UI */}
    <div className="mb-4 space-y-1 text-xs">
      {/* 브랜드 필터 */}
      <div>
        <div className="overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar -mx-2 px-2 py-1">
          {["보보쇼즈", "미니로디니","타오", "루이스미샤","아폴리니", "던스","봉주르다이어리","콩제슬래드"].map((b) => {
            const selectedBrands = brand?.split(",") || [];
            const isSelected = selectedBrands.includes(b);

            const nextBrands = isSelected
              ? selectedBrands.filter((v) => v !== b)
              : [...selectedBrands, b];

            const query = new URLSearchParams();
            if (category) query.set("category", category);
            if (size) query.set("size", size);
            if (nextBrands.length > 0) query.set("brand", nextBrands.join(","));

            return (
              <Link
                key={b}
                href={`?${query.toString()}`}
                className={`inline-block px-2 py-[3px] mr-2 mb-1 rounded-full border h-6 leading-4 ${
                  isSelected ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {b}
              </Link>
            );
          })}
        </div>
      </div> 

      {/* 사이즈 필터 */}
      <div>
        <div className="overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar -mx-2 px-2 py-1">
          {["6m-12m","12m-24m","1y-2y","2y-3y","3y-4y","4y-5y","5y-6y","6y-7y","7y-8y","8y-9y","9y-10y"].map((s) => {
            const selectedSizes = size?.split(",") || [];
            const isSelected = selectedSizes.includes(s);

            const nextSizes = isSelected
              ? selectedSizes.filter((v) => v !== s)
              : [...selectedSizes, s];

            const query = new URLSearchParams();
            if (category) query.set("category", category);
            if (brand) query.set("brand", brand);
            if (nextSizes.length > 0) query.set("size", nextSizes.join(","));

            return (
              <Link
                key={s}
                href={`?${query.toString()}`}
                className={`inline-block px-2 py-[3px] mr-2 mb-1 rounded-full border h-6 leading-4 ${
                  isSelected ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 전체 필터 초기화 */}
      <div className="px-2 -mx-2">
        <Link
          href="/products"
          className="inline-block text-gray-400 underline text-xs"
        >
          전체 필터 초기화
        </Link>
      </div>
    </div>



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
                      품절
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

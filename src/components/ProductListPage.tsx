"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

export default function ProductListPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const size = searchParams.get("size");
  const search = searchParams.get("search");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageMap, setCurrentImageMap] = useState<Record<number, number>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        let result: Product[] = [];

        if (search) {
          const res = await fetch(`/api/search-products?search=${encodeURIComponent(search)}`);
          const json = await res.json();
          result = json.data || [];
        } else {
          const res = await fetch("/api/all-products"); // 전체 불러오기용 API 따로 만들기 권장
          const json = await res.json();
          result = json.data || [];
        }

        // 클라이언트 필터링 (카테고리, 브랜드, 사이즈만)
        const selectedBrands = brand?.split(",") || [];
        const selectedSizes = size?.split(",") || [];

        const filtered = result.filter((p) => {
          const categoryMatch = category ? p.category?.includes(category) : true;
          const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(p.brand) : true;
          const sizeMatch = selectedSizes.length > 0 ? selectedSizes.includes(p.size) : true;
          const statusMatch = p.status === "판매중"; // ✅ status 조건 추가
          
          return categoryMatch && brandMatch && sizeMatch;
        });

        setProducts(filtered);
      } catch (err) {
        console.error("상품 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category, brand, size, search]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageMap((prev) => {
        const next = { ...prev };
        products.forEach((p) => {
          if (p.image_model) {
            const current = prev[p.id] || 0;
            next[p.id] = (current + 1) % 2;
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products]);

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
          {["보보쇼즈", "미니로디니","타오", "루이스미샤","아폴리나", "던스","봉주르다이어리","콩제슬래드"].map((b) => {
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
          {["70","85","95","110","120","130","140"].map((s) => {
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
            const isSoldOut  = ["판매완료", "환불요청"].includes(product.status);
            const images = product.image_model ? [product.image, product.image_model] : [product.image];
            const imageToShow = images[currentImageMap[product.id] ?? 0];
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
                    src={imageToShow}
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
                {(() => {
                  const discount = product.discountRate ?? 0;
                  const discountedPrice = Math.round(product.price * (1 - discount / 100));
                  const finalBenefitPrice = Math.round(discountedPrice * 0.8); // ✅ 20% 추가 할인

                  return (
                    <div className="mt-1 text-xs">
                      <p className={`font-bold ${isSoldOut ? "text-gray-500" : "text-black"}`}>
                        ₩{discountedPrice.toLocaleString()}
                      </p>
                      {discount > 0 && (
                        <p className="text-[11px] text-gray-400 line-through">
                          최초판매가 ₩{product.price.toLocaleString()} | {discount}% 할인
                        </p>
                      )}
                      <p className="text-[12px] text-[#FF6B6B] font-semibold mt-1">
                        예상 혜택가 ₩{finalBenefitPrice.toLocaleString()}
                      </p>
                    </div>
                  );
                })()}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

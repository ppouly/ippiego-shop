"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="p-4 pt-16 max-w-md mx-auto">
      <h1 className="text-lg font-semibold mb-3">상품 검색</h1>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="상품명이나 브랜드를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm"
        />
        <button
          onClick={handleSearch}
          className="bg-black text-white text-sm px-4 py-2 rounded-md"
        >
          검색
        </button>
      </div>

      {/* 추천 키워드 등도 여기에 추가 가능 */}
    </div>
  );
}

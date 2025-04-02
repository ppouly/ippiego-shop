// src/app/page.tsx

"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">IPPIEGO</h1>
        <button
          className="text-blue-500 text-sm"
          onClick={() => router.push("/products")}
        >
          전체 상품 보기 →
        </button>
      </div>

      <div className="rounded overflow-hidden">
        <Image
          src="/banner.jpg"
          alt="banner"
          width={600}
          height={300}
          className="w-full h-auto"
        />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">추천 상품</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded p-2">
            <Image
              src="/product1.jpg"
              alt="product"
              width={300}
              height={300}
              className="w-full"
            />
            <p className="mt-2 text-sm font-medium">스마일 티셔츠</p>
            <p className="text-xs text-gray-400">₩75,000</p>
          </div>
          <div className="border rounded p-2">
            <Image
              src="/product2.jpg"
              alt="product"
              width={300}
              height={300}
              className="w-full"
            />
            <p className="mt-2 text-sm font-medium">레인보우 원피스</p>
            <p className="text-xs text-gray-400">₩89,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

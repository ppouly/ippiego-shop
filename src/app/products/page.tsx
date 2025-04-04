// src/app/products/page.tsx

"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const products = [
  {
    id: 1,
    name: "스마일 티셔츠",
    price: 75000,
    image: "/product1.jpg",
  },
  {
    id: 2,
    name: "레인보우 원피스",
    price: 89000,
    image: "/product2.jpg",
  },
];

export default function ProductListPage() {
  const router = useRouter();

  return (
    <div className="w-full p-4 bg-[#F7F2EB] rounded-xl">
      <h1 className="text-xl font-bold mb-4">전체 상품</h1>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded p-2 cursor-pointer"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="w-full"
            />
            <p className="mt-2 text-sm font-medium">{product.name}</p>
            <p className="text-xs text-gray-400">
              ₩{product.price.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

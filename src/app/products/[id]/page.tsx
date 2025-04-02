// src/app/product/[id]/page.tsx

"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCartStore } from "@/store/cart"; // 장바구니 상태 추가

const productList = [
  {
    id: 1,
    name: "스마일 티셔츠",
    price: 75000,
    image: "/product1.jpg",
    detail: "유쾌한 감성의 스마일 프린팅 코튼 티셔츠",
  },
  {
    id: 2,
    name: "레인보우 원피스",
    price: 89000,
    image: "/product2.jpg",
    detail: "화사한 컬러감의 귀여운 레인보우 원피스",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const product = productList.find((p) => p.id === id);

  if (!product) return <p className="p-4">상품을 찾을 수 없습니다.</p>;

  return (
    <div className="p-4 pb-24">
      <Image
        src={product.image}
        alt={product.name}
        width={600}
        height={600}
        className="w-full"
      />
      <h1 className="text-xl font-bold mt-4">{product.name}</h1>
      <p className="text-gray-500">₩{product.price.toLocaleString()}</p>
      <p className="mt-4 text-sm">{product.detail}</p>

      {/* 고정 구매 버튼 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4">
      <button
        className="w-full bg-black text-white py-3 rounded-lg text-sm"
        onClick={() => {
          useCartStore.getState().addToCart(product);
          console.log("현재 장바구니 상태:", useCartStore.getState().items);
          alert("장바구니에 담겼어요!");
        }}
      >
        장바구니 담기
      </button>

      </div>
    </div>
  );
}

// src/app/product/[id]/page.tsx

"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart"; // 장바구니 상태 추가
import type { Product } from "@/types/product";


export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  //const SUPABASE_URL = "https://jcigjtydsfzbwvkivehd.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaWdqdHlkc2Z6Ynd2a2l2ZWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NDY1NTksImV4cCI6MjA1OTUyMjU1OX0._VQ3uGXTl29ppaPxptXAt-HUGs9Zf4stUlDNb1Yj9Q8";


  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`https://jcigjtydsfzbwvkivehd.supabase.co/rest/v1/products?id=eq.${id}`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization:  `Bearer ${SUPABASE_KEY}`,
          },
        });
  
        if (!res.ok) {
          throw new Error("상품이 존재하지 않습니다.");
        }
  
        const data = await res.json();
        setProduct(data[0]); // Supabase는 배열로 반환하므로 첫 번째 아이템 선택
      } catch (error) {
        console.error("상품 데이터를 불러오는 중 오류 발생:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
  
    fetchProduct();
  }, [id]);
  
  

  if (loading) return <p className="p-4">로딩 중...</p>;
  if (!product) return <p className="p-4">상품을 찾을 수 없습니다.</p>;


  return (
    <div className="w-full pb-[120px]">
    {/* 상품 상단 정보 */}
    <div className="w-full p-4 bg-[#F7F2EB]">
      <Image
        src={product.image}
        alt={product.name}
        width={600}
        height={600}
        className="w-full h-auto object-contain"
      />
      <p className="text-s font-bold text-[#FF6B6B] mt-2">{product.brand}
        <span className="text-s mt-1 font-bold text-[#3F8CFF] ml-2">{product.size}</span>
      </p>
      <h1 className="text-xl font-bold mt-1">{product.name}</h1>
      <p className="text-gray-500">
        ₩{product.price.toLocaleString()}
      </p>
    </div>

    {/* 상세 설명 영역 (div로 따로 분리, 흰 배경, 전체 너비) */}
    <div
      className="w-full bg-white py-6 text-sm"
      dangerouslySetInnerHTML={{
        __html: product.description || "",
      }}
    />

    {/* 고정 구매 버튼 */}
    <div className="fixed bottom-[56px] shadow-md left-0 w-full bg-white p-4">
      <button
        className="w-full bg-black text-white py-3 rounded-lg text-sm"
        onClick={() => {
          useCartStore.getState().addToCart(product!);
          alert("장바구니에 담겼어요!");
        }}
      >
        장바구니 담기
      </button>
    </div>
  </div>  
  );
}

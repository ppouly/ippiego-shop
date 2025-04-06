// src/app/product/[id]/page.tsx

"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart"; // 장바구니 상태 추가


type Product = {
  id: number;
  name: string;
  brand: string;
  category1: string;
  category2: string;
  size: string;
  price: number;
  purchasePrice: number;
  image: string;
  colors: string[];
  conditionGrade: string;
  description: string;
  createdAt: string;
  status: string;
  [key: string]: any; // ← 기타 필드는 선택
};  


export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const SUPABASE_URL = "https://jcigjtydsfzbwvkivehd.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaWdqdHlkc2Z6Ynd2a2l2ZWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NDY1NTksImV4cCI6MjA1OTUyMjU1OX0._VQ3uGXTl29ppaPxptXAt-HUGs9Zf4stUlDNb1Yj9Q8";


  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`https://YOUR_PROJECT_ID.supabase.co/rest/v1/products?id=eq.${id}`, {
          headers: {
            apikey: "YOUR_ANON_KEY",
            Authorization: `Bearer YOUR_ANON_KEY`,
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
    <div className="w-full p-4 bg-[#F7F2EB] rounded-xl"> 
      <Image
        src={product.image}
        alt={product.name}
        width={600}
        height={600}
        className="w-full h-auto object-contain"
      />
      <h1 className="text-xl font-bold mt-4">{product.name}</h1>
      <p className="text-gray-500">₩{product.price.toLocaleString()}</p>
      <p className="mt-4 text-sm">{product.detail}</p>

      {/* 고정 구매 버튼 */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4">
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

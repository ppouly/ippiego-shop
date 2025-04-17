"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";
import Link from "next/link";
import { fetchValidProducts } from "@/lib/fetchProducts";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'qa' | 'exchange'>('description');
  const [currentImage, setCurrentImage] = useState(0);

  // 하나의 useEffect에서 상품 상세 및 추천 상품을 불러옵니다.
  useEffect(() => {
    async function loadProductAndRelated() {
      try {
        const allProducts = await fetchValidProducts();

        // 상세 상품 찾기
        const found = allProducts.find((item) => item.id === Number(id));
        if (!found) throw new Error("상품이 존재하지 않습니다.");
        setProduct(found);

        // 추천 상품 : 같은 사이즈, 현재 상품 제외, 최대 10개
        const related = allProducts
          .filter((item) => item.size === found.size && item.id !== found.id)
          .slice(0, 10);
        setRelatedProducts(related);
      } catch (err) {
        console.error("상품 상세 또는 추천 불러오기 실패:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProductAndRelated();
  }, [id]);

  if (loading) return <p className="p-4">로딩 중...</p>;
  if (!product) return <p className="p-4">상품을 찾을 수 없습니다.</p>;

  const imageList = [
    `/products/${product.id}/main.jpg`,
    `/products/${product.id}/detail1.jpg`,
    `/products/${product.id}/detail2.jpg`,
  ];

  return (
    <div className="w-full pb-[120px] bg-[#FFFFFF]">
      {/* 상품 이미지 슬라이더 + 토글 */}
      <div className="w-full px-4 mt-4">
        <div
          className="overflow-x-auto flex gap-4 scrollbar-hide snap-x snap-mandatory bg-[#FFFFFF] rounded-xl py-2"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const width = e.currentTarget.clientWidth;
            const newIndex = Math.round(scrollLeft / (width - 32));
            setCurrentImage(newIndex);
          }}
        >
          {imageList.map((src, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[300px] h-[360px] snap-start rounded-xl overflow-hidden bg-[#FFFFFF]"
            >
              <Image
                src={src}
                alt={`상품 이미지 ${idx + 1}`}
                width={300}
                height={360}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* 토글 인디케이터 */}
        <div className="flex justify-center mt-3 gap-2">
          {imageList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                currentImage === idx ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="p-4">
        <p className="text-xs font-bold text-[#FF6B6B]">
          {product.brand}{" "}
          <span className="ml-2 text-[#3F8CFF]">{product.size}</span>
        </p>
        <h1 className="text-lg font-extrabold text-gray-800 mt-1">
          {product.name}
        </h1>
        <div className="mt-1 text-base text-black font-semibold">
          ₩{product.price.toLocaleString()}
          {product.discountRate !== 0 && (
            <>
              <span className="ml-2 text-sm text-gray-400 line-through">
                판매가 ₩{product.price?.toLocaleString()}
              </span>
              <span className="ml-1 text-sm text-gray-400">
                | {product.discountRate}% 할인
              </span>
            </>
          )}
        </div>
      </div>

      {/* 배송안내 */}
      <div className="bg-white px-4 py-5 border-t border-b">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">배송비</span>
          <span className="text-gray-500">
            2,500원 (30,000원 이상 구매시 무료배송)
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">발송예정일</span>
          <span className="text-gray-500">
            평일 오후 2시 이전 결제 시 당일 출고
          </span>
        </div>
      </div>

      {/* 추천 상품 슬라이더 */}
      <div className="px-4 py-5 mb-3">
        <h3 className="font-bold text-sm text-[#222] mb-2">
          같은 사이즈 다른 상품
        </h3>
        <div className="overflow-x-auto flex gap-4 scrollbar-hide">
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="flex-none w-[140px]"
            >
              <div className="w-[140px] h-[180px] rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={140}
                  height={180}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs mt-1 text-gray-700 truncate">
                {item.name}
              </p>
              <p className="text-xs font-bold text-gray-900">
                ₩{item.price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white px-4 py-5 border-t">
        <h2 className="text-sm font-bold text-gray-800 mb-3"> 등급안내 </h2>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 border-t text-xl">
            {product.conditionGrade}
          </span>
          <span className="text-gray-500">
            실착 후 세탁 1~2회로 새 상품과 같은 상태{" "}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-1 font-bold text-orange-500">
          <span></span>
          <span>상태가 걱정되나요? 받아보고 교환/환불 가능해요 </span>
        </div>
      </div>

      {/* 포장 안내 */}
      <div className="font-bold bg-white px-4 py-4 mx-4 rounded-lg shadow-sm text-sm">
        <Image
          src={product.pkg_image}
          alt="포장 이미지"
          width={600}
          height={400}
          className="w-full rounded mb-2"
        />
        <p>🧼 8無 안심세제로 세탁 완료!<br /></p>
        <p className="text-center"> 포장 완료! </p>
        <p className="text-right"> 바로출고 가능해요 🧼</p>
      </div>

      {/* 탭 영역 */}
      <div className="mt-6 px-4 py-4 mb-3">
        <div className="mt-4 flex justify-between border-b mb-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 flex-1 ${
              activeTab === "description"
                ? "border-b-2 border-black text-black"
                : "text-gray-400"
            }`}
          >
            상세설명
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`pb-2 flex-1 ${
              activeTab === "qa"
                ? "border-b-2 border-black text-black"
                : "text-gray-400"
            }`}
          >
            Q&A
          </button>
          <button
            onClick={() => setActiveTab("exchange")}
            className={`pb-2 flex-1 ${
              activeTab === "exchange"
                ? "border-b-2 border-black text-black"
                : "text-gray-400"
            }`}
          >
            교환/환불 정책
          </button>
        </div>

        {activeTab === "description" && (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description || "" }}
          />
        )}

        {activeTab === "qa" && (
          <div className="px-4 py-4 text-sm text-gray-600">
            <p>자주 묻는 질문 및 답변은 준비 중입니다 💬</p>
          </div>
        )}

        {activeTab === "exchange" && (
          <div className="px-4 py-4 text-sm text-gray-600">
            <p>· 교환 및 환불은 수령일로부터 10일 이내 가능합니다.</p>
            <p>· 착용/세탁/훼손된 상품은 교환 및 환불이 어렵습니다.</p>
            <p>· 상품 택(tag) 제거된 상품은 교환 및 환불이 어렵습니다.</p>
            <p>· 고객 단순 변심의 경우 왕복 배송비가 부과됩니다.</p>
          </div>
        )}
      </div>

      <div className="bg-white px-4 py-5 border-t border-b">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">시즌</span>
          <span className="text-gray-500">{product.season}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">브랜드 표기 사이즈</span>
          <span className="text-gray-500">{product.brandSize}</span>
        </div>
      </div>

      <div className="px-4 py-5 mb-3">
        <h3 className="font-bold text-sm text-[#222] mb-3">👯 자매룩 · 형제룩 추천</h3>
        {/* TODO: 슬라이더 삽입 */}
      </div>

      {/* 하단 고정 구매 버튼 */}
      <div className="fixed bottom-[56px] shadow-md left-0 w-full bg-white p-4 z-10">
        {product.status === "판매완료" ? (
          <button
            className="w-full bg-gray-400 text-white py-3 rounded-xl text-base font-semibold cursor-not-allowed"
            disabled
          >
            품절
          </button>
        ) : (
          <button
            className="w-full bg-black text-white py-3 rounded-xl text-base font-semibold"
            onClick={() => {
              useCartStore.getState().addToCart(product!);
              alert("장바구니에 담겼어요!");
            }}
          >
            장바구니 담기
          </button>
        )}
      </div>
    </div>
  );
}

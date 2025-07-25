"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";
import Link from "next/link";
import { fetchValidProducts } from "@/lib/fetchProducts";
import IppiegoSizeTable from '@/components/IppiegoSizeTable';
import { AutoLogPageView } from "@/components/AutoLogPageView";

const conditionDescriptions: Record<string, React.ReactNode> = {
  S: (
    <>
      택이 그대로 있거나 미착용에 가까운 상태로,<br />
      오염·보풀 없이 새 옷처럼 깨끗해요.
    </>
  ),
  A: (
    <>
      착용 3~5회 정도로 세탁은 되었지만 <br />
      소재 원형 유지된 매우 깔끔한 상태예요.
    </>
  ),
  B: (
    <>
      여러 차례 착용된 상품이지만 전체적으로 양호해요. <br />
      약간 늘어남/줄어듬·보풀·색빠짐이 있을 수 있어요.
    </>
  ),
  C: (
    <>
      많은 사용감·생활이염·변색·올나감 중 하나라도<br />
      해당되는 상품으로 사진과 코멘트를 확인해주세요.<br />
      🚨C등급은 환불 왕복 배송비가 항상 무료🚨
    </>
  ),
  D: (
    <>
      찢어짐, 큰 얼룩, 변형 등 손상된 부분이 있어 <br />
      빈티지나 리페어 용도로 적합해요.
    </>
  ),
}; 

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'qa' | 'exchange'>('description');
  const [currentImage, setCurrentImage] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [displayBrandOrCategoryProducts, setDisplayBrandOrCategoryProducts] = useState<Product[]>([]);
  const [siblingLookProducts, setSiblingLookProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProductAndRelated() {
      try {
        const allProducts = await fetchValidProducts();
        const found = allProducts.find((item) => item.id === Number(id));
        if (!found) throw new Error("상품이 존재하지 않습니다.");
        setProduct(found);

        const sizeOnly = allProducts.filter(
          (item) => item.id !== found.id && item.size === found.size &&
          item.status !== "판매완료"  // 🔥 품절 제외 추가!
        );

        const related = allProducts
          .filter(
            (item) =>
              item.id !== found.id &&
              item.size === found.size &&
              item.category1 === found.category1 &&
              item.status !== "판매완료"  // 🔥 품절 제외 추가!
          )
          .slice(0, 10);

        const relatedToShow = related.length > 1 ? related : sizeOnly;
        setRelatedProducts(relatedToShow);

        const sameBrand = allProducts
          .filter(
            (item) =>
              item.id !== found.id &&
              item.size === found.size &&
              item.brand === found.brand &&
              item.status !== "판매완료"  // 🔥 품절 제외 추가!
          )
          .slice(0, 10);

        const brandToShow = sameBrand.length > 1 ? sameBrand : sizeOnly;
        setDisplayBrandOrCategoryProducts(brandToShow);

        const siblings = allProducts
          .filter(
            (item) =>
              item.id !== found.id &&
              item.brand === found.brand &&
              item.size !== found.size &&
              item.status !== "판매완료"  // 🔥 품절 제외 추가!
          )
          .slice(0, 10);

        setSiblingLookProducts(siblings);

      } catch (err) {
        console.error("상품 상세 또는 추천 불러오기 실패:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProductAndRelated();
  }, [id]);

  useEffect(() => {
    console.log("🔥 상품 데이터:", product);
  }, [product]);

  if (loading) return <p className="p-4">로딩 중...</p>;
  if (!product) return <p className="p-4">상품을 찾을 수 없습니다.</p>;

  const imageList = [
    `/products/${product.id}/main.webp`,
    `/products/${product.id}/detail1.webp`,
    `/products/${product.id}/detail2.webp`,
    `/products/${product.id}/detail3.webp`, 
  ];

  return (
    <div className="w-full pb-[120px] bg-[#FFFFFF]">
      <AutoLogPageView />
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

      <div className="p-4">
          {/* 🔍 안내 배너 삽입 */}
      <div className="mx-0 mb-3 px-4 py-3 bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg text-[13px] text-gray-600 leading-relaxed text-center">
        🔍 <strong className="text-gray-700 font-medium">AI 모델 착용 이미지는 연출된 이미지</strong>이며,<br />
        <strong className="text-gray-700 font-medium">상세컷은 실제 상품 실사</strong>입니다.
      </div>
      <p className="text-xs font-bold text-[#FF6B6B]">
        {product.brand} <span className="ml-2 text-[#3F8CFF]">{product.size}</span>
      </p>
      <h1 className="text-lg font-extrabold text-gray-800 mt-1">{product.name}</h1>

      {/* ✅ 할인 가격 계산 */}
      {(() => {
  const discountRate = product.discountRate ?? 0;  // ← undefined 방지!
  const discountedPrice = Math.round(product.price * (1 - discountRate / 100));
  const finalBenefitPrice = Math.round(discountedPrice * 0.8); // 20% 추가 혜택

  return (
    <>
      <div className="mt-1 text-base text-black font-semibold">
        ₩{discountedPrice.toLocaleString()}
        {discountRate > 0 && (
          <>
            <span className="ml-2 text-sm text-gray-400 line-through">
              최초판매가 ₩{product.price.toLocaleString()}
            </span>
            <span className="ml-1 text-sm text-gray-400">
              | {discountRate}% 할인
            </span>
          </>
        )}
      </div>
      <div className="mt-1">
        <p className="text-sm text-[#FF6B6B] font-bold">
          예상 혜택가 ₩{finalBenefitPrice.toLocaleString()} 
        </p>
        <p className="text-xs text-[#FF6B6B] mt-1">
          * 회원주문 5% 상시 할인<br></br>
        * {" "}
            <a
              href="http://pf.kakao.com/_xblzfn"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 hover:opacity-80"
            >카카오채널 
            </a>{" "}추가 시 15% 쿠폰 바로 발급<br></br>
             
            * {" "}
            <a
              href="https://www.instagram.com/ippiego"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 hover:opacity-80"
            >인스타 
            </a>{" "} 
            친구추가 후 말걸면 20% 쿠폰 지급
        </p>
      </div>
      
    </>
  );
})()}

    </div>


      <div className="bg-white px-4 py-5 border-t border-b">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">배송비</span>
          <span className="text-gray-500">3,500원 (50,000원 이상 구매시 무료배송)</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">발송예정일</span>
          <span className="text-gray-500">평일 오후 2시 이전 결제 시 당일 출고</span>
        </div>
      </div>

      <div className="px-4 py-5 mb-3">
        <h3 className="font-bold text-sm text-[#222] mb-2">같은 사이즈 다른 상품</h3>
        <div className="overflow-x-auto flex gap-4 scrollbar-hide">
          {relatedProducts.map((item) => (
            <Link key={item.id} href={`/products/${item.id}`} className="flex-none w-[140px]">
              <div className="w-[140px] h-[180px] rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={140}
                  height={180}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs mt-1 text-gray-700 truncate">{item.name}</p>
              {(() => {
                const discountRate = item.discountRate ?? 0;
                const discountedPrice = Math.round(item.price * (1 - discountRate / 100));

                return (
                  <>
                    <p className="text-xs font-bold text-black">₩{discountedPrice.toLocaleString()}</p>
                    {discountRate > 0 && (
                      <p className="text-[11px] text-gray-400 line-through">
                        ₩{item.price.toLocaleString()} | {discountRate}% 할인
                      </p>
                    )}
                  </>
                );
              })()}

            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white px-4 py-6 border-t space-y-4">
        <h2 className="text-sm font-bold text-gray-800 mb-2">등급안내</h2>
        <div className="flex items-start justify-between gap-6">
          <span className="text-orange-500 text-4xl font-extrabold pl-2 min-w-[32px]">
            {product.conditionGrade}
          </span>
          <p className="text-xs text-right text-gray-700 leading-5 max-w-[85%]  overflow-hidden">
            {conditionDescriptions[product.conditionGrade]}
          </p>
        </div>
        <div className="text-sm font-semibold text-orange-500 text-right mt-2">
          <h1>상태가 걱정되나요? <p></p> 입히고에서는 받아보고 교환/환불 가능해요</h1>
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
      </div>
      <div className="font-bold bg-white px-4 py-4 mx-4 rounded-lg shadow-sm text-sm">
        <Image
          src={"/pkg_cmplt.jpg"}
          alt="포장 안내"
          width={600}
          height={200}
          className="w-full rounded mb-2"
        />
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
          <div className="text-sm leading-relaxed">
            {/* ✅ 고정 이미지 삽입 */}
            <div className="mb-4">
              <Image
                src="/notice_real_photo.jpg"  // public 폴더 안의 이미지 경로
                alt="실물 촬영 안내"
                width={600}
                height={400}
                className="w-full rounded"
              />
            </div>

            {/* ✅ 상품 상세 HTML 삽입 */}
            <div className="mt-14" dangerouslySetInnerHTML={{ __html: product.description || "" }} />

          </div>
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
            <p>· 상품 택(tag)이 제거된 경우, 상품 금액의 30%를 제외한 금액이 환불 처리됩니다.</p>
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
          <span className="text-gray-600">입히고 사이즈</span>
          <span className="text-gray-500">{product.size}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">브랜드 표기 사이즈</span>
          <span className="text-gray-500">{product.brandSize}</span>
        </div>
        {/* ✅ 여기!!! IppiegoSizeTable 삽입 */}
        <div className="mb-8 text-gray-500 text-xs mt-5">
          <h1>📢 입히고에서는 ⟨입히고 자체 사이즈⟩를 표기합니다.  </h1>      
          <IppiegoSizeTable selectedSize={product.size} brand={product.brand} />
        </div>

      </div>
    <div className="px-4 py-5 mb-3">
    <h3 className="font-bold text-sm text-[#222] mb-2"> 같은 사이즈 추천 ✨</h3>
    <div className="overflow-x-auto flex gap-4 scrollbar-hide">
      {displayBrandOrCategoryProducts.map((item) => (
        <Link key={item.id} href={`/products/${item.id}`} className="flex-none w-[140px]">
          <div className="w-[140px] h-[180px] rounded-md overflow-hidden bg-gray-100">
            <Image
              src={item.image}
              alt={item.name}
              width={140}
              height={180}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs mt-1 text-gray-700 truncate">{item.name}</p>
          {(() => {
            const discountRate = item.discountRate ?? 0;
            const discountedPrice = Math.round(item.price * (1 - discountRate / 100));
            return (
              <>
                <p className="text-xs font-bold text-black">₩{discountedPrice.toLocaleString()}</p>
                {discountRate > 0 && (
                  <p className="text-[11px] text-gray-400 line-through">
                    ₩{item.price.toLocaleString()} | {discountRate}% 할인
                  </p>
                )}
              </>
            );
          })()}
        </Link>
      ))}
    </div>
  </div>

        <div className="px-4 py-5 mb-3">
        <h3 className="font-bold text-sm text-[#222] mb-3">자매룩 · 형제룩 추천 👯</h3>
        <div className="overflow-x-auto flex gap-4 scrollbar-hide">
          {siblingLookProducts.map((item) => (
            <Link key={item.id} href={`/products/${item.id}`} className="flex-none w-[140px]">
              <div className="w-[140px] h-[180px] rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={140}
                  height={180}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs mt-1 text-gray-700 truncate">{item.name}</p>
              <p className="text-[11px] text-gray-500">{item.size}</p>
              {(() => {
                const discountRate = item.discountRate ?? 0;
                const discountedPrice = Math.round(item.price * (1 - discountRate / 100));
                return (
                  <>
                    <p className="text-xs font-bold text-black">₩{discountedPrice.toLocaleString()}</p>
                    {discountRate > 0 && (
                      <p className="text-[11px] text-gray-400 line-through">
                        ₩{item.price.toLocaleString()} | {discountRate}% 할인
                      </p>
                    )}
                  </>
                );
              })()}
            </Link>
          ))}
        </div>
      </div>

      {showToast && (
  <div className="fixed bottom-[220px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-black text-white text-sm rounded-lg shadow-md z-50 flex items-center gap-3 w-[320px]">
     <div className="flex items-center gap-2">
      <span className="text-s">✅</span>
      <span className="text-s font-medium">장바구니에 담겼어요!</span>
    </div>
    <Link 
      href="/cart"
      className="underline font-semibold text-white text-xs ml-4"
    >
      장바구니로 이동
    </Link>
  </div>
)}


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
            onClick={async () => {
              if (!product) return;

              const discountedPrice = Math.round(product.price * (1 - (product.discountRate || 0) / 100));

              useCartStore.getState().addToCart({
                ...product,
                price: discountedPrice,
                originalPrice: product.price,
                discountRate: product.discountRate || 0,
              });

              try {
                await fetch("/api/log/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productId: product.id,
                    timestamp: new Date().toISOString(),
                  }),
                });
              } catch (e) {
                console.error("장바구니 로그 실패", e);
              }

              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }}
          >
            장바구니 담기
          </button>

        )}
      </div>
    </div>
  );
}

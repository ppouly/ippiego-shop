"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
//import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { fetchValidProducts } from "@/lib/fetchProducts";
import { LogPageView } from "@/components/LogPageView";
import ReviewSlide from "@/components/ReviewSlide";

const banners = [
  {
    image: "/banner1.jpg",
    text: " ",
  },
  {
    image: "/banner2.jpg",
    //text: "Vintage Vibes, Modern Fun",
  },
  {
    image: "/banner3.jpg",
    //text: "Bold Colors, Big Adventures",
  },
  {
    image: "/banner4.jpg",
    //text: "Bold Colors, Big Adventures",
  },
];



// 👉 메인 배너 슬라이더를 별도 컴포넌트로 분리
function MainBannerSlider() {
  const [sliderRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    renderMode: "performance",
    slides: {
      origin: "center",
      perView: 1,
    },
    drag: true,
    created(slider) {
      setInterval(() => {
        slider.next();
      }, 4000);
    },
  });

  return (
    <div ref={sliderRef} 
         className="keen-slider w-full max-w-[768px] mx-auto overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={index}
          className="keen-slider__slide relative aspect-[2/3] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${banner.image})`, 
                   backgroundColor: "#f7f2eb", // 예: 크림색 (브랜드 톤) 
                  }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute bottom-10 left-5 right-5 text-white text-center text-xl font-bold drop-shadow-lg"
          >
            {banner.text}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {

  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState("전체");
  const [products, setProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [currentImageMap, setCurrentImageMap] = useState<Record<number, number>>({});

 
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchValidProducts();
  
        // ✅ created_at 기준 내림차순 정렬
        const sorted = [...data].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
  
        setProducts(sorted);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err);
      }
    }
  
    load();
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageMap((prev) => {
        const nextMap = { ...prev };
        products.forEach((p) => {
          if (p.image_model) {
            const current = prev[p.id] || 0;
            nextMap[p.id] = (current + 1) % 2;
          }
        });
        return nextMap;
      });
    }, 3000);
  
    return () => clearInterval(interval);
  }, [products]);
  
  useEffect(() => {
    const hide = localStorage.getItem("hideHolidayBanner");
    if (hide === "true") {
      setShowBanner(false);
    }
  }, []);
  const filteredProducts =
  selectedSize === "전체"
    ? [...products].reverse() // 오래된 순 (createdAt 빠른 순)
    : [...products]
        .filter((p) => p.size === selectedSize)
        .reverse();


  const visibleProducts = showAll 
      ? filteredProducts 
      : filteredProducts.slice(0, 6);

  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;
  
      
  return (
    <div className="p-4">
      <LogPageView path="/" />
            {/* ✅ 가운데 상단 플로팅 배너 */}
            {showBanner && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 shadow-lg bg-white border border-gray-200 rounded-xl w-[370px] max-w-full">
          <div className="relative p-3">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
              aria-label="배너 닫기"
            >
              ×
            </button>
            <Image
              src="/banner-holiday.png"
              alt="입히고 플로팅 배너안내"
              width={320}
              height={200}
              className="rounded-lg w-full h-auto"
              priority
            />
            {/* ✅ 버튼 추가 */}
            <div className="mt-3 flex justify-center gap-3">
                {/* 카카오 로그인 */}
                <button
                  onClick={() => {
                    window.location.href = "/mypage";
                  }}
                  className="bg-yellow-400 text-black text-xs font-semibold py-1.5 px-3 rounded-md shadow hover:opacity-90"
                >
                  카카오로 시작하기
                </button>

              <a
                href="http://pf.kakao.com/_xblzfn"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FEE500] text-black text-xs font-semibold py-1.5 px-3 rounded-md shadow hover:opacity-90"
              >
                카카오채널
              </a>
              <a
                href="https://www.instagram.com/ippiego"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md shadow hover:opacity-90"
              >
                인스타그램
              </a>
            </div>
            {/* ✅ 다시 보지 않기 버튼 */}
            <div className="flex justify-center mt-2">
              <button
                onClick={() => {
                  localStorage.setItem("hideHolidayBanner", "true");
                  setShowBanner(false);
                }}
                className="text-xs text-gray-400 hover:underline"
              >
                다시 보지 않기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 배너 */}
      <MainBannerSlider />

      {/* 추천 상품 슬라이더 */}
      <div className="mt-6">
      <h2 className="text-lg font-semibold text-black mb-2 flex items-center justify-between">
  New
  <span className="text-sm text-gray-500 ml-2">매주 금요일 밤, 새 옷들이 도착해요 🛎️</span>
</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          spaceBetween={16}
          breakpoints={{
            0: { slidesPerView: 1.2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {products
            .filter((p) => !["판매완료", "환불요청"].includes(p.status))
            .slice(0, 7)
            .map((product) => {
              return (
                <SwiperSlide key={product.id}>
                <div
                  className="cursor-pointer bg-white rounded-xl overflow-hidden"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  {/* 이미지 영역: 실사 + 모델컷 */}
                  <div className="flex bg-[#F7F2EB]">
                    <div className="w-[180px] h-[220px]">
                      <Image
                        src={product.image}
                        alt={`${product.name} 실사`}
                        width={180}
                        height={220}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    {product.image_model && (
                      <div className="w-[120px] h-[220px]">
                        <Image
                          src={product.image_model}
                          alt={`${product.name} 모델컷`}
                          width={120}
                          height={220}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 영역 */}
                  <div className="px-3 py-2 text-left">
                    <p className="text-xs text-[#FF6B6B]">
                      {product.brand}
                      <span className="ml-2 text-[#3F8CFF]">{product.size}</span>
                    </p>
                    <p className="text-sm font-medium text-black mt-1">{product.name}</p>

                    {(() => {
                      const discountRate = product.discountRate ?? 0;
                      const discountedPrice = Math.round(product.price * (1 - discountRate / 100));
                      const finalBenefitPrice = Math.round(discountedPrice * 0.8);

                      return (
                        <div className="mt-1 text-sm">
                          <p className="font-bold text-black">
                            ₩{discountedPrice.toLocaleString()}
                          </p>
                          {discountRate > 0 && (
                            <p className="text-[11px] text-gray-400 line-through">
                              최초판매가 ₩{product.price.toLocaleString()} | {discountRate}% 할인
                            </p>
                          )}
                          <p className="text-[12px] text-[#FF6B6B] font-semibold mt-1">
                            예상 혜택가 ₩{finalBenefitPrice.toLocaleString()}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </SwiperSlide>


              
            );
          })}
        </Swiper>

        <section>
        <h2 className="text-lg font-semibold mt-7 mb-2">생생 후기🧡</h2>
        <ReviewSlide />
      </section>

      {/* 사이즈별 추천 상품 목록 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-black mb-4">사이즈 별 전체 상품</h2>
        <div className="overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar px-2 py-1 -mx-4">
          {["전체","70","85","95","110","120","130","140"].map((size) => (
            <button
              key={size}
              onClick={() => {
                setSelectedSize(size);
                setShowAll(false); // 탭 바꾸면 다시 접힘
              }}
              className={`inline-block text-sm font-semibold mr-0.5 px-2 py-2 rounded-full  ${
                selectedSize === size
                  ? "text-black underline"
                  : "text-gray-400"
              }`}
            >
              #{size}
            </button>
          ))}
        </div>        
        <div className="grid grid-cols-2 gap-4">
        {visibleProducts.map((product) => {
  const isSoldOut = product.status === "판매완료" || product.status === "환불요청";
  const images = product.image_model ? [product.image, product.image_model] : [product.image];
  const imageToShow = images[currentImageMap[product.id] ?? 0];

  return (
    <div
      key={product.id}
      className="cursor-pointer"
      onClick={() => !isSoldOut && router.push(`/products/${product.id}`)}
    >
      <div
        className={`relative w-full h-[240px] ${
          isSoldOut ? "bg-gray-200" : "bg-[#f7f2eb]"
        } flex items-center justify-center rounded-md overflow-hidden`}
      >
        <Image
          src={imageToShow}
          alt={product.name}
          width={160}
          height={160}
          className={`object-contain w-auto h-full ${isSoldOut ? "opacity-50" : ""}`}
          unoptimized
        />
        {isSoldOut && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] font-semibold px-2 py-[2px] rounded-sm">
            품절
          </div>
        )}
      </div>
      <p className={`mt-1 text-xs ${isSoldOut ? "text-gray-400" : "text-[#FF6B6B]"}`}>
        {product.brand}
        <span className="text-xs text-[#3F8CFF] ml-2">{product.size}</span>
      </p>
      <p className={`text-sm font-medium ${isSoldOut ? "text-gray-500" : "text-black"}`}>
        {product.name}
      </p>
      {(() => {
          const discount = product.discountRate ?? 0;
          const discountedPrice = Math.round(product.price * (1 - discount / 100));
          const benefitPrice = Math.round(discountedPrice * 0.8); // 20% 추가 혜택

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

              {/* 예상 혜택가는 항상 노출 */}
              <p className="text-[12px] text-[#FF6B6B] font-semibold mt-1">
                예상 혜택가 ₩{benefitPrice.toLocaleString()}
              </p>
            </div>
          );
        })()}

    </div>
  );
})}


        </div>

      {/* 더보기 / 접기 버튼 */}
      {filteredProducts.length > 2 && (
        <div className="mt-4 text-center">
          <button onClick={() => setShowAll(!showAll)} className="inline-flex justify-center">
            <Image
              src={showAll ? "/up.jpg" : "/down.jpg"}
              alt="더보기 버튼"
              width={24}
              height={24}
            />
          </button>
        </div>
      )}  
      </section>

      {/* 푸터: 사업자 정보 */}  
      <footer className="mt-16 text-left text-xs text-gray-400 border-t pt-4 leading-relaxed px-2">
        <p>상호명: 입히고 | 대표자명: 백수정</p>
        <p>사업자등록번호: 425-33-01604</p>
        <p>통신판매업 신고번호: 2025-성남분당A-0351</p>
        <p>사업장 주소: 경기도 분당구 서판교로132번길 24</p>
        <p>유선번호: 010-4759-9255</p>
            
        {/* ⛔ 중첩된 <p> → ✅ <div>로 수정 */}
        <div className="flex space-x-4 mt-1">
          <a href="/privacy-policy" className="hover:underline">
            개인정보처리방침
          </a>
          {/* 다른 링크 추가 가능 */}
          {/* <Link href="/terms" className="hover:underline">이용약관</Link> */}
        </div>
        <div className="text-xs text-[#FF6B6B] mt-1">
          고객센터/CS:{" "}
          <a
            href="http://pf.kakao.com/_xblzfn"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 hover:opacity-80"
          >
            입히고 카카오채널
          </a>
        </div>
        <p className="mt-1">© 2025 IPPIEGO. All rights reserved.</p>
      </footer>



      </div>
    </div>
  );
}

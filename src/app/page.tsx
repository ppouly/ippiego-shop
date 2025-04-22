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
 
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchValidProducts();
        setProducts(data);
      } catch (err) {
        console.error("❌ 상품 불러오기 실패:", err);
      }
    }
  
    load();
  }, []);
  

  const filteredProducts =
    selectedSize === "전체"
      ? products
      : products.filter((p) => p.size === selectedSize);

  const visibleProducts = showAll 
      ? filteredProducts 
      : filteredProducts.slice(0, 6);
      
  return (
    <div className="p-4">
      {/* 배너 */}
      <MainBannerSlider />

      {/* 추천 상품 슬라이더 */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-black mb-2">이번주 신상</h2>
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
            .filter((p) => p.status !== "판매완료") // "판매완료" 제외
            .slice(0, 7)
            .map((product) => {
              return (
              <SwiperSlide key={product.id}>
                <div
                  className="border-none rounded p-2 cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <div className="w-full h-[280px] bg-[#F7F2EB] flex items-center justify-center rounded-md overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={280}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#FF6B6B]">
                    {product.brand}
                    <span className="text-xs mt-1 text-[#3F8CFF] ml-2">
                      {product.size}
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-black">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    ₩{product.price.toLocaleString()}
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

      {/* 사이즈별 추천 상품 목록 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-black mb-4">사이즈 별 전체 상품</h2>
        <div className="overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar mr-1 px-4 py-2 px-4 -mx-4">
          {["전체", "6m-12m","12m-24m","1y-2y","2y-3y","3y-4y", "4y-5y", "5y-6y", "6y-7y", "7y-8y", "8y-9y", "9y-10y"].map((size) => (
            <button
              key={size}
              onClick={() => {
                setSelectedSize(size);
                setShowAll(false); // 탭 바꾸면 다시 접힘
              }}
              className={`inline-block text-sm font-semibold mr-0.5 px-4 py-2 rounded-full  ${
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
          const isSoldOut = product.status === "판매완료";
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
                  src={product.image}
                  alt={product.name}
                  width={160}
                  height={160}
                  className={`object-contain w-auto h-full ${
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
              <p className={`mt-1 text-xs ${isSoldOut ? "text-gray-400" : "text-[#FF6B6B]"}`}>
                {product.brand}
              </p>
              <p className={`text-sm font-medium ${isSoldOut ? "text-gray-500" : "text-black"}`}>
                {product.name}
              </p>
              <p className="text-xs text-gray-400">₩{product.price.toLocaleString()}</p>
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
        <p>유선번호: 010-5470-9225</p> 
        <p className="mt-1">© 2025 IPPIEGO. All rights reserved.</p>
      </footer>


      </div>
    </div>
  );
}

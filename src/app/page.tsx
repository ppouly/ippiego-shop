"use client";
import { useState } from "react";
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

const products = [
  {
    id: 1,
    name: "스마일 티셔츠",
    price: 35000,
    image: "/product1.jpg",
    brand: "미니로디니",
    size: "3y-4y",
  },
  {
    id: 2,
    name: "레인보우 원피스",
    price: 29000,
    image: "/product2.jpg",
    brand: "미니로디니",
    size: "3y-4y",    
  },
  {
    id: 3,
    name: "컬러풀 후디",
    price: 22000,
    image: "/product3.jpg",
    brand: "미니로디니",
    size: "5y-6y",    
  },
  {
    id: 4,
    name: "스마일 티셔츠",
    price: 35000,
    image: "/product1.jpg",
    brand: "미니로디니",
    size: "3y-4y",
  },
  {
    id: 5,
    name: "레인보우 원피스",
    price: 29000,
    image: "/product2.jpg",
    brand: "미니로디니",
    size: "3y-4y",    
  },
  {
    id: 6,
    name: "컬러풀 후디",
    price: 22000,
    image: "/product3.jpg",
    brand: "미니로디니",
    size: "5y-6y",    
  },  
  {
    id: 7,
    name: "스마일 티셔츠",
    price: 35000,
    image: "/product1.jpg",
    brand: "미니로디니",
    size: "3y-4y",
  },
  {
    id: 8,
    name: "레인보우 원피스",
    price: 29000,
    image: "/product2.jpg",
    brand: "미니로디니",
    size: "3y-4y",    
  },
  {
    id: 9,
    name: "컬러풀 후디",
    price: 22000,
    image: "/product3.jpg",
    brand: "미니로디니",
    size: "5y-6y",    
  },   
];

const banners = [
  {
    image: "/banner1.jpg",
    //text: "Dress Up, Run Wild, Go Ippie!",
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
                   backgroundColor: "#fff5e0", // 예: 크림색 (브랜드 톤) 
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
  const [showAll, setShowAll] = useState(false);

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
          {products.map((product) => (
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
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">{product.brand}</p>
                <p className="mt-2 text-sm font-medium text-black">{product.name}</p>
                <p className="text-xs text-gray-400">
                  ₩{product.price.toLocaleString()}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      {/* 사이즈별 추천 상품 목록 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-black mb-4">사이즈 별 전체 상품</h2>
        <div className="flex gap-4 mt-2 mb-4">
          {["전체", "3y-4y", "5y-6y", "7y-8y"].map((size) => (
            <button
              key={size}
              onClick={() => {
                setSelectedSize(size);
                setShowAll(false); // 탭 바꾸면 다시 접힘
              }}
              className={`text-sm font-semibold ${
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
          {visibleProducts.map((product) => (
            <div key={product.id} className="cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
              <div className="w-full h-[240px] bg-[#fff5e0] flex items-center justify-center rounded-md overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={160}
                  height={160}
                  className="object-contain w-auto h-full"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">{product.brand}</p>
              <p className="text-sm font-medium text-black">{product.name}</p>
              <p className="text-xs text-gray-400">₩{product.price.toLocaleString()}</p>
            </div>
          ))}
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


      </div>
    </div>
  );
}

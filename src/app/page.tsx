"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { motion } from "framer-motion";

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
  {
    id: 3,
    name: "컬러풀 후디",
    price: 92000,
    image: "/product3.jpg",
  },
];

const banners = [
  {
    image: "/banner1.jpg",
    text: "Dress Up, Run Wild, Go Ippie!",
  },
  {
    image: "/banner2.jpg",
    text: "Vintage Vibes, Modern Fun",
  },
  {
    image: "/banner3.jpg",
    text: "Bold Colors, Big Adventures",
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
    <div ref={sliderRef} className="keen-slider h-screen w-full overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={index}
          className="keen-slider__slide relative h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${banner.image})` }}
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
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full rounded-none border-none shadow-none"
                />
                <p className="mt-2 text-sm font-medium text-black">{product.name}</p>
                <p className="text-xs text-gray-400">
                  ₩{product.price.toLocaleString()}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

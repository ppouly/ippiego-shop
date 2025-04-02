"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

export default function Home() {
  const router = useRouter();

  return (
    <div className="p-4">
      {/* 상단 로고 + 전체보기 */}
      <div className="flex justify-between items-center mb-4">
        <Image src="/logo.png" alt="logo" width={100} height={40} />
        <button
          className="text-blue-500 text-sm"
          onClick={() => router.push("/products")}
        >
          전체 상품 보기 →
        </button>
      </div>

      {/* 배너 */}
      <div className="rounded overflow-hidden">
        <Image
          src="/banner.jpg"
          alt="banner"
          width={600}
          height={300}
          className="w-full h-auto"
        />
      </div>

      {/* 추천 상품 슬라이더 */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">추천 상품</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          spaceBetween={16}
          breakpoints={{
            0: { slidesPerView: 1.2 },      // 모바일
            768: { slidesPerView: 2 },      // 태블릿
            1024: { slidesPerView: 3 },     // 데스크탑
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div
                className="border rounded p-2 cursor-pointer"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full rounded"
                />
                <p className="mt-2 text-sm font-medium">{product.name}</p>
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

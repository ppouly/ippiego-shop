"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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
    link: "https://www.ippiego.shop/products",
    text: " ",
  },
  {
    image: "/banner2.jpg",
    link: "https://www.ippiego.shop/cart",
  },
  {
    image: "/banner3.jpg",
    link: "https://www.ippiego.shop/products?brand=%EB%B3%B4%EB%B3%B4%EC%87%BC%EC%A6%88",
  },
  {
    image: "/banner4.jpg",
    link: "https://smartstore.naver.com/ippiego",
  },
];

function MainBannerSlider() {
  const [sliderRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    renderMode: "performance",
    slides: { origin: "center", perView: 1 },
    drag: true,
    created(slider) {
      setInterval(() => {
        slider.next();
      }, 4000);
    },
  });

  return (
    <div
      ref={sliderRef}
      className="keen-slider w-full aspect-square mx-auto overflow-hidden"
    >
      {banners.map((banner, index) => (
        <a
          key={index}
          href={banner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="keen-slider__slide relative bg-contain bg-center bg-no-repeat block"
          style={{
            backgroundImage: `url(${banner.image})`,
            backgroundColor: "#f7f2eb",
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
        </a>
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [excludeSkirt, setExcludeSkirt] = useState(false);
  const [saveFilters, setSaveFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [currentImageMap, setCurrentImageMap] = useState<Record<number, number>>({});
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);


  useEffect(() => {
    async function load() {
      try {
        const data = await fetchValidProducts();
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
    if (hide === "true") setShowBanner(false);
  }, []);

      // 초기 불러오기
    useEffect(() => {
      const saved = localStorage.getItem("myChildFilters");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedSize(parsed.size || []);
        setSelectedBrand(parsed.brand || []);
        setExcludeSkirt(parsed.excludeSkirt || false);
      }
    }, []);

    // 저장
    useEffect(() => {
      if (saveFilters) {
        localStorage.setItem(
          "myChildFilters",
          JSON.stringify({
            size: selectedSize,
            brand: selectedBrand,
            excludeSkirt,
          })
        );
      }
    }, [saveFilters, selectedSize, selectedBrand, excludeSkirt]);


    // 1️⃣ 필터링 (사이즈, 브랜드, 스커트 제외 등)
    const filteredProducts = products
      .filter((p) => {
        const sizeMatch = selectedSize.length === 0 || selectedSize.includes(p.size ?? "");
        const brandMatch = selectedBrand.length === 0 || selectedBrand.includes(p.brand ?? "");
        const skirtMatch =
          !excludeSkirt || (p.category2 !== "치마" && p.category2 !== "원피스" && p.category2 !== "스커트" && p.category2 !== "블라우스");
        return sizeMatch && brandMatch && skirtMatch;
      })
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)); // ⭐️ 인기순 정렬

    // 2️⃣ 10개 이하면 전부, 10개 초과면 slice
    const visibleProducts = showAll ? filteredProducts : filteredProducts.slice(0, 10);


  return (
    <div className="p-4">
      <LogPageView path="/" />

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
              priority // ✅ 첫 화면: priority 유지
            />
            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={() => window.location.href = "/mypage"}
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

      <MainBannerSlider />

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
            .map((product) => (
              <SwiperSlide key={product.id}>
                <div
                  className="cursor-pointer bg-white rounded-xl overflow-hidden"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <div className="flex bg-[#F7F2EB]">
                    <div className="w-[180px] h-[220px]">
                      <Image
                        src={product.image}
                        alt={`${product.name} 실사`}
                        width={180}
                        height={220}
                        className="w-full h-full object-cover"
                        unoptimized
                        loading="lazy" // ✅
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
                          loading="lazy" // ✅
                        />
                      </div>
                    )}
                  </div>
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
                          <p className="font-bold text-black">₩{discountedPrice.toLocaleString()}</p>
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
            ))}
        </Swiper>
        
        <section>
          <h2 className="text-lg font-semibold mt-7 mb-2">생생 포토 후기🧡</h2>
          <ReviewSlide />
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-black mb-1">내 아이 상품 고르기</h2>
          <p className="text-[12px] text-gray-400 mt-1 mb-2">
            우리 아이에게 딱 맞는 상품을 쉽게 골라보세요!
          </p>
          {/* 🪄 여기! 카드형 버튼 UI로 교체 */}
          <div className="flex gap-2">
          {/* 사이즈 고르기 */}
          <button
            onClick={() => setShowSizeModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-[70px] rounded-lg bg-[#FF6B6B] text-white shadow hover:shadow-md transition"
          >
            <span className="text-sm font-semibold">사이즈 고르기</span>
            <span className="text-xs">예: 85, 95, 110</span>
          </button>

          {/* 브랜드 선택 */}
          <button
            onClick={() => setShowBrandModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-[70px] rounded-lg bg-[#FF6B6B] text-white shadow hover:shadow-md transition"
            >
            <span className="text-sm font-semibold">브랜드 선택</span>
            <span className="text-xs">예: 보보쇼즈, 타오</span>
          </button>

          {/* 치마/스커트 제외 */}
          <button
            onClick={() => setExcludeSkirt(!excludeSkirt)}
            className={`flex flex-col justify-center items-center flex-1 h-[70px] rounded-lg ${
              excludeSkirt ? "border-2 border-[#FF6B6B]" : "border border-gray-200"
            } bg-white shadow hover:shadow-md transition`}
          >
            <span className="text-sm font-semibold text-gray-700">여아 카테고리 제외</span>
            <span className="text-xs">예: 치마, 원피스</span>
          </button>
        </div>



        <div className="flex justify-end mt-2">
        <label className="flex items-center gap-1 text-xs text-gray-500 font-normal">
          <input
            type="checkbox"
            checked={saveFilters}
            onChange={(e) => setSaveFilters(e.target.checked)}
          />
          다음에도 저장할래요
        </label>
      </div>



        <div className="grid grid-cols-2 gap-4 mt-4">
          {visibleProducts.map((product) => {
            const isSoldOut = product.status === "판매완료" || product.status === "환불요청";
            const images = product.image_model ? [product.image, product.image_model] : [product.image];
            const imageToShow = images[currentImageMap[product.id] ?? 0];

            // 필터 적용
            const sizeMatch =
              selectedSize.length === 0 || selectedSize.includes(product.size ?? "");
            const brandMatch =
              selectedBrand.length === 0 || selectedBrand.includes(product.brand ?? "");
            const skirtMatch =
              !excludeSkirt ||
              (product.category2 !== "치마" && product.category2 !== "원피스");

            if (!sizeMatch || !brandMatch || !skirtMatch) return null;

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
                    loading="lazy"
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
                  const benefitPrice = Math.round(discountedPrice * 0.8);
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


        {filteredProducts.length > 10 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex flex-col items-center gap-1"
          >
            <Image
              src={showAll ? "/up.jpg" : "/down.jpg"}
              alt={showAll ? "접기 버튼" : "더보기 버튼"}
              width={56}
              height={56}
              loading="lazy"
            />
            <span className="text-sm font-semibold text-gray-700">
              {showAll ? "접기" : "더보기"}
            </span>
          </button>
        </div>
      )}





      </section>

      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[300px] max-w-[90%] shadow-lg">
            <h3 className="text-base font-semibold mb-3">사이즈 선택</h3>
            <div className="flex flex-wrap gap-2">
              {["70", "85", "95", "110", "120", "130", "140"].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize((prev) => {
                      const has = prev.includes(size);
                      const next = has ? prev.filter((s) => s !== size) : [...prev, size];
                      return next;
                    });
                  }}
                  className={`px-3 py-1 rounded-full border ${
                    selectedSize.includes(size) ? "bg-[#FF6B6B] text-white" : "bg-white text-gray-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-sm text-gray-600 hover:underline"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[300px] max-w-[90%] shadow-lg">
            <h3 className="text-base font-semibold mb-3">브랜드 선택</h3>
            <div className="flex flex-wrap gap-2">
              {["전체", "보보쇼즈", "미니로디니", "아폴리나",  "타오","루이스미샤","봉주르다이어리","타이니코튼","던스"].map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    if (brand === "전체") {
                      // 전체 선택은 배열을 비워서 모든 브랜드 허용
                      setSelectedBrand([]);
                    } else {
                      // 기존 복수 선택 로직 유지
                      setSelectedBrand((prev) => {
                        const has = prev.includes(brand);
                        const next = has ? prev.filter((b) => b !== brand) : [...prev, brand];
                        return next;
                      });
                    }
                  }}
                  className={`px-3 py-1 rounded-full border ${
                    selectedBrand.includes(brand) || (brand === "전체" && selectedBrand.length === 0)
                      ? "bg-[#FF6B6B] text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowBrandModal(false)}
                className="text-sm text-gray-600 hover:underline"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}



        <footer className="mt-16 text-left text-xs text-gray-400 border-t pt-4 leading-relaxed px-2">
          <p>상호명: 입히고 | 대표자명: 백수정</p>
          <p>사업자등록번호: 425-33-01604</p>
          <p>통신판매업 신고번호: 2025-성남분당A-0351</p>
          <p>사업장 주소: 경기도 분당구 서판교로132번길 24</p>
          <p>유선번호: 010-4759-9255</p>
          <div className="flex space-x-4 mt-1">
            <a href="/privacy-policy" className="hover:underline">개인정보처리방침</a>
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

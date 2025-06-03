// src/components/CategoryPage.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const categoryTabs = ["아이템", "브랜드", "신상구상,자랑!"];

const clothingCategories = [
  "아우터", "상의", "하의", "원피스", "셋업", "스윔수트", "모자신발"
];

const vintageCategories = ["5천원", "7천원", "9천원"];

const similarCategories = ["남매룩", "자매룩", "형제룩"];

const brandList = [
  {
    id: "bobo",
    name: "보보쇼즈",
    image: "/brands/bobo.webp",
    description: "스페인 감성 키즈룩 대표 브랜드",
  },
  {
    id: "mini",
    name: "미니로디니",
    image: "/brands/mini.webp",
    description: "지구를 생각한 유기농 패션",
  },
  {
    id: "tao",
    name: "타오",
    image: "/brands/tao.webp",
    description: "예술적 감성의 유니크 디자인",
  },
  {
    id: "louise",
    name: "루이스미샤",
    image: "/brands/louise.webp",
    description: "보헤미안 감성 프렌치룩",
  },
  {
    id: "apolina",
    name: "아폴리나",
    image: "/brands/apolina.webp",
    description: "자수와 플로럴 무드의 정수",
  },
  {
    id: "duns",
    name: "던스",
    image: "/brands/duns.webp",
    description: "컬러풀한 북유럽 키즈룩",
  },
  {
    id: "bonjour",
    name: "봉주르다이어리",
    image: "/brands/bonjour.webp",
    description: "빈티지 감성의 아트웨어",
  },
];

export default function CategoryPage() {
  const [activeTab, setActiveTab] = useState("브랜드");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const router = useRouter();

  const brand = brandList.find((b) => b.name === selectedBrand);

  return (
    <div className="p-4">
      {/* 탭 선택 영역 */}
      <div className="flex justify-around border-b mb-4">
        {categoryTabs.map((tab) => (
          <button
            key={tab}
            className={`pb-2 text-sm font-semibold ${
              activeTab === tab
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      {activeTab === "아이템" && (
        <div>
          <h2 className="text-xl font-bold text-gray-500 mb-2">패션</h2>
          <div className="grid grid-cols-3 gap-2 mb-10">
            {clothingCategories.map((item) => (
              <CategoryButton key={item} label={item} />
            ))}
          </div>
          <h2 className="text-xl font-bold text-grey-500 mb-2">시밀러룩</h2>
          <div className="grid grid-cols-3 gap-2 mb-10">
            {similarCategories.map((item) => (
              <CategoryButton
                key={item}
                label={item}
                highlight={item === "5천원"}
              />
            ))}
          </div>
          <h2 className="text-xl font-bold text-orange-500 mb-2">빈티지 보물찾기 &quot;천원마켓&quot;</h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {vintageCategories.map((item) => (
              <CategoryButton
                key={item}
                label={item}
                highlight={item === "5천원"}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "브랜드" && (
        <div>
          <div className="flex flex-col gap-4 mb-6">
            {brandList.map((b) => (
              <button
                key={b.id}
                className={`text-2xl font-bold border-b-2 text-left ${
                  selectedBrand === b.name ? "border-black" : "border-transparent"
                }`}
                onClick={() => setSelectedBrand(b.name)}
              >
                {b.name}
              </button>
            ))}
          </div>

          {brand && (
            <div
              className="relative rounded overflow-hidden cursor-pointer mt-6"
              onClick={() => router.push(`/products?brand=${encodeURIComponent(brand.name)}`)}
            >
              <Image
                src={brand.image}
                alt={brand.name}
                width={800}
                height={400}
                className="w-full h-[300px] object-cover rounded-md"
              />
              <div className="absolute bottom-4 left-4 text-white drop-shadow">
                <h3 className="text-xl font-bold">{brand.name}</h3>
                <p className="text-sm whitespace-pre-line">{brand.description}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "신상구상,자랑!" && <div> 신상구상,자랑!은 준비 중입니다 💬</div>}
    </div>
  );
}

function CategoryButton({ label, highlight }: { label: string; highlight?: boolean }) {
  const router = useRouter();

  return (
    <button
      className={`text-sm p-2 ${
        highlight ? "text-grey-500 font-semibold" : "text-gray-800"
      }`}
      onClick={() => router.push(`/products?category=${encodeURIComponent(label)}`)}
    >
      {label}
    </button>
  );
}

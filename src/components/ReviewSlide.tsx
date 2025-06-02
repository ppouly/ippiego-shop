"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";

interface Review {
  content: string;
  image_url: string;
  nickname?: string;
  created_at: string;
}

export default function ReviewSlide() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch("/api/reviews-latest");
      const data = await res.json();
      setReviews(data.reviews);
    };
    fetchReviews();
  }, []);

  return (
    <Swiper spaceBetween={10} slidesPerView={"auto"} className="py-4">
  {reviews.map((r, idx) => (
    <SwiperSlide key={idx} style={{ width: "160px" }}>
          <div className="h-[140px] flex flex-col justify-between rounded-xl border shadow p-1 bg-white">
            {/* 이미지 */}
            <div className="w-full h-[120px] relative rounded-md overflow-hidden">
              <Image
                src={r.image_url}
                alt="review image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* 후기 내용 (고정 높이 + 줄임) */}
            <p className="text-[12px] text-gray-700 mt-1 line-clamp-3 h-[55px] overflow-hidden">
              {r.content}
            </p>

            {/* 작성자, 날짜 */}
            <div className="text-[10px] text-gray-400 mt-1">
              {r.nickname ?? "익명"} · {new Date(r.created_at).toLocaleDateString()}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>

  );
}

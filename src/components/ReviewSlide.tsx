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
    <Swiper spaceBetween={12} slidesPerView={"auto"} className="py-4">
      {reviews.map((r, idx) => (
        <SwiperSlide key={idx} style={{ width: "220px" }}>
          <div className="rounded-xl border shadow p-3 bg-white">
            <div className="w-full h-32 relative rounded-md overflow-hidden">
              <Image
                src={r.image_url}
                alt="review image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-sm text-gray-700 mt-2 line-clamp-3">{r.content}</p>
            <div className="text-xs text-gray-400 mt-1">
              {r.nickname ?? "익명"} · {new Date(r.created_at).toLocaleDateString()}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

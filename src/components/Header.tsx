"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function Header() {
    const router = useRouter();
    const [hidden, setHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
  
    // 스크롤 방향 감지
    useEffect(() => {
      const handleScroll = () => {
        const currentY = window.scrollY;
        if (currentY > lastScrollY && currentY > 50) {
          setHidden(true); // 아래로 → 숨김
        } else {
          setHidden(false); // 위로 → 다시 보여줌
        }
        setLastScrollY(currentY);
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);
  
    return (
      <header
        className={`fixed top-0 left-0 w-full h-14 bg-white border-b border-gray-200 z-50 px-4 flex items-center justify-between transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
      {/* 로고 */}
      <div onClick={() => router.push("/")} className="cursor-pointer">
        <Image src="/logo.png" alt="logo" width={90} height={30} />
      </div>

      {/* 아이콘들 */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/search")}>
          <Image src="/icon-search.svg" alt="search" width={20} height={20} />
        </button>
        <button onClick={() => router.push("/cart")}>
          <Image src="/icon-cart.svg" alt="cart" width={20} height={20} />
        </button>
      </div>
    </header>
  );  
}

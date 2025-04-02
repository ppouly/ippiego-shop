"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, List, User, Clock } from "lucide-react";
import { AiFillHome, AiOutlineUser } from "react-icons/ai";
import { MdCategory } from "react-icons/md";
import { RiHistoryLine } from "react-icons/ri";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 50) {
        setHidden(true); // 아래로 스크롤 → 숨김
      } else {
        setHidden(false); // 위로 스크롤 → 다시 보이기
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const menus = [
    { label: "홈", icon: <AiFillHome size={22} />, path: "/" },
    { label: "카테고리", icon: <MdCategory size={22} />, path: "/category" },
    { label: "최근본", icon: <RiHistoryLine size={22} />, path: "/recent" },
    { label: "마이", icon: <AiOutlineUser size={22} />, path: "/mypage" },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 w-full bg-white border-t flex justify-around items-center h-14 z-50 transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      {menus.map((menu) => (
        <button
          key={menu.path}
          onClick={() => router.push(menu.path)}
          className={`flex flex-col items-center text-xs ${
            pathname === menu.path
              ? "text-black font-semibold"
              : "text-gray-400"
          }`}
        >
          {menu.icon}
          <span>{menu.label}</span>
        </button>
      ))}
    </nav>
  );
}

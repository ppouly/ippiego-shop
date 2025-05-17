"use client";

import { useEffect } from "react";

export default function DetectInstagram() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("instagram")) {
        document.documentElement.classList.add("is-instagram");
      }
    }
  }, []);

  return null;
}

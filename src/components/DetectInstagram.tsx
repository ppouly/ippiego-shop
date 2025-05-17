// src/components/DetectInstagram.tsx
"use client";

import { useEffect } from "react";

export default function DetectInstagram() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("instagram")) {
      document.documentElement.classList.add("is-instagram");
    }
  }, []);

  return null;
}

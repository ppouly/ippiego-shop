// components/AutoLogPageView.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AutoLogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/log-pageview", {
      method: "POST",
      body: JSON.stringify({ path: pathname }),
    });
  }, [pathname]);

  return null;
}

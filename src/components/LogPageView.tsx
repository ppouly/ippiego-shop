// components/LogPageView.tsx
"use client";

import { useEffect } from "react";

export function LogPageView({ path }: { path: string }) {
  useEffect(() => {
    const referrer = document.referrer; // ← 유입 경로

    fetch("/api/log-pageview", {
      method: "POST",
      body: JSON.stringify({ path, referrer }),
    });
  }, [path]);

  return null;
}

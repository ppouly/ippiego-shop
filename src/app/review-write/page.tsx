// ❌ "use client" 금지
// ✅ 서버 컴포넌트 → 동적 처리 강제
export const dynamic = "force-dynamic";

import ReviewWriteClient from "./ReviewWriteClient";

export default function ReviewWritePage() {
  return <ReviewWriteClient />;
}

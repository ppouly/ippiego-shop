import { Suspense } from "react";
import LoginPage from "./LoginPage"; // ← 방금 만든 컴포넌트

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LoginPage />
    </Suspense>
  );
}

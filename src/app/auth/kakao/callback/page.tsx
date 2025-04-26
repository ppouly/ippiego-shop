import { Suspense } from "react";
import KakaoCallbackInner from "./KakaoCallbackInner";

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KakaoCallbackInner />
    </Suspense>
  );
}

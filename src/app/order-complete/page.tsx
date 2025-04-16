import { Suspense } from "react";
import OrderCompleteClient from "./OrderCompleteClient";

export default function OrderCompletePage() {
  return (
    <Suspense fallback={<p className="p-4">결제 확인 중...</p>}>
      <OrderCompleteClient />
    </Suspense>
  );
}

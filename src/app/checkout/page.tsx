import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="p-4">로딩 중...</p>}>
      <CheckoutClient />
    </Suspense>
  );
}

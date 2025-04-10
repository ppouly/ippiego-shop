import { Suspense } from "react";
import ProductListPage from "@/components/ProductListPage";

export default function ProductsPage() {
  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <ProductListPage />
    </Suspense>
  );
}

// src/app/products/page.tsx
import { Suspense } from "react";
import ProductListPage from "@/components/ProductListPage";


export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500" />
        </div>
      }
    >
      <ProductListPage />
    </Suspense>
  );
}

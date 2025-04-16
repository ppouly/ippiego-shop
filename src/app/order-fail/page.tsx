import { Suspense } from "react";
import FailPageClient from "./FailPageClient";

export default function FailPage() {
  return (
    <Suspense fallback={<p className="p-4">잠시만 기다려주세요...</p>}>
      <FailPageClient />
    </Suspense>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function FailPageClient() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  return (
    <div className="wrapper w-full px-6 py-10">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center">
        <Image
          src="https://static.toss.im/lotties/error-spot-apng.png"
          width={120}
          height={120}
          alt="에러"
        />
        <h2 className="text-xl font-bold text-red-500">결제에 실패했어요</h2>

        <div className="w-full text-sm bg-red-50 rounded p-4 border border-red-200 text-left">
          <p className="mb-1">
            <strong>에러 코드:</strong> {errorCode}
          </p>
          <p>
            <strong>메시지:</strong> {errorMessage}
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-6 w-full">
          <Link
            href="/"
            className="btn w-full text-center border px-4 py-2 rounded bg-white shadow"
          >
            홈으로 돌아가기
          </Link>

          <div className="flex gap-4">
            <a
              className="btn w-full text-sm text-blue-500 underline"
              href="https://docs.tosspayments.com/reference/error-codes"
              target="_blank"
              rel="noreferrer noopener"
            >
              에러코드 문서 보기
            </a>
            <a
              className="btn w-full text-sm text-blue-500 underline"
              href="https://techchat.tosspayments.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              실시간 문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

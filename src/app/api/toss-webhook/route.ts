import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Toss Webhook - 결제 성공 알림 처리
 */
export async function POST(req: Request) {
  try {
    // ✅ Toss가 보내준 데이터 파싱
    const body = await req.json();
    const { orderId, status, paymentKey } = body;

    // ✅ 결제 성공인 경우만 처리
    if (status === "DONE") {
      // ✅ orders 테이블에서 해당 orderId의 상태를 결제완료로 업데이트
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "결제완료",
          payment_key: paymentKey,
        })
        .eq("order_id", orderId);

      if (updateError) {
        console.error("❌ 주문 상태 업데이트 실패:", updateError.message);
        return NextResponse.json(
          { result: "fail", error: updateError.message },
          { status: 500 }
        );
      }

      console.log(`✅ Webhook: 주문(${orderId}) 결제완료로 업데이트됨`);
      return NextResponse.json({ result: "success" }, { status: 200 });
    }

    // ✅ 결제 실패/취소 등은 따로 처리하지 않고 무시
    console.warn(`ℹ️ Webhook: 상태(${status}) 처리하지 않음`);
    return NextResponse.json({ result: "ignored" }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook 처리 중 오류:", err);
    return NextResponse.json({ result: "fail", error: String(err) }, { status: 500 });
  }
}

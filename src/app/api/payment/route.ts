import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { orderId, orderName, amount, customerName } = await req.json();

  console.log("📦 클라이언트에서 받은 결제 요청:", {
    orderId,
    orderName,
    amount,
    customerName,
  });

  if (!orderId || !amount || !orderName || !customerName) {
    return NextResponse.json({ ok: false, message: "필수 결제 정보 누락" }, { status: 400 });
  }

  if (!process.env.TOSS_SECRET_KEY) {
    console.error("❌ TOSS_SECRET_KEY 누락");
    return NextResponse.json({ ok: false, message: "서버 설정 오류" }, { status: 500 });
  }


  const authHeader = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");

const tossRes = await fetch("https://api.tosspayments.com/v1/payment-links", {
  method: "POST",
  headers: {
    Authorization: `Basic ${authHeader}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: Number(amount),
    orderId,
    orderName,
    customerName,
    successUrl: "http://localhost:3000/order-complete",
    failUrl: "http://localhost:3000/order-fail",
  }),
});



  // ✅ Toss에 보낼 요청 내용 미리 로그 찍기
  console.log("📤 Toss에 보낼 데이터:", {
    orderId,
    orderName,
    amount: Number(amount),
    customerName,
    successUrl: "http://localhost:3000/order-complete",
    failUrl: "http://localhost:3000/order-fail",
  });

  // const result = await tossRes.json();

  const text = await tossRes.text();
  console.log("📦 Toss 응답 원문:", text);

  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("❌ 응답 JSON 파싱 실패:", e);
    return NextResponse.json({ ok: false, message: "Toss 응답 오류" }, { status: 500 });
  }


  if (!tossRes.ok) {
    console.error("❌ Toss 결제창 생성 실패:", tossRes.status, result);
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  console.log("✅ Toss 결제창 생성 성공:", result);
  return NextResponse.json({ ok: true, paymentUrl: result.paymentUrl });
}

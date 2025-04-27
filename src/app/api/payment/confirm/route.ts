import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ message: "필수 파라미터 누락" }, { status: 400 });
    }

    const secretKey = process.env.TOSS_SECRET_KEY!;
    const encryptedSecretKey = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");

    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ 결제 승인 실패:", data);
      return NextResponse.json({ message: "결제 승인 실패", error: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ 서버 오류:", error);
    return NextResponse.json({ message: "서버 오류", error: String(error) }, { status: 500 });
  }
}

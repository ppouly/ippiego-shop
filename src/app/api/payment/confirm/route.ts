import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ message: "필수 파라미터 누락" }, { status: 400 });
  }

  const secretKey = process.env.TOSS_SECRET_KEY!;
  const encryptedSecretKey = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");

  try {
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: encryptedSecretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        amount: Number(amount),
        paymentKey,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: "결제 승인 실패", error: data }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ message: "서버 오류", error: String(err) }, { status: 500 });
  }
}

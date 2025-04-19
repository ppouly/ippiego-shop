// declare module "@tosspayments/tosspayments-sdk";
// types/toss.d.ts 또는 global.d.ts

export {}; // 글로벌 타입 충돌 방지

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment(options: {
        method: string;
        amount: number;
        orderId: string;
        orderName: string;
        customerName: string;
        customerEmail: string;
        successUrl: string;
        failUrl: string;
      }): void;
    };
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          roadAddress: string;
          jibunAddress: string;
          userSelectedType: string;
        }) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

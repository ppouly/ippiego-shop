import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '입히고 - 환불보장 수입 아동복 중고 마켓',
  description: '보보쇼즈, 미니로디니, 아폴리나, 던스, 루이스미샤, 타오, 봉주르다이어리 등 인기 수입 아동복 중고를 엄선해 판매하는 입히고. 환불보장, 인증된 안심세제 세탁으로 믿고 구매하세요.',
  keywords: ['보보쇼즈 중고', '미니로디니 중고','던스 순무','보보쇼즈 딸기','아폴리나 중고','루이스미샤 중고','타오 중고', '중고 아동복', '입히고', '수입 아동복'],
  openGraph: {
    title: '입히고 - 환불보장 수입 아동복 빈티지 마켓',
    description: '보보쇼즈, 미니로디니, 아폴리나, 던스, 루이스미샤, 타오, 봉주르다이어리 등 인기 수입 아동복 중고를 엄선해 판매하는 입히고. 믿고 사는 중고 아동복 마켓.',
    url: 'https://ippiego.shop/',
    siteName: '입히고',
    images: [
      {
        url: 'https://ippiego.shop/og-image.jpg', // og 이미지 경로 (필요하면 내가 도와줄게 만들어서)
        width: 1200,
        height: 630,
        alt: '입히고 대표 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};
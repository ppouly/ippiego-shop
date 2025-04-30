import { Suspense } from "react";
import ProductListPage from "@/components/ProductListPage";
import { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: URLSearchParams;
}): Promise<Metadata> {
  const brand = searchParams.get('brand');
  const baseUrl = 'https://ippiego.shop/products'; // ← 너 사이트 주소에 맞게 수정

  const canonicalUrl = brand
    ? `${baseUrl}?brand=${encodeURIComponent(brand)}`
    : baseUrl;

  if (brand === '보보쇼즈') {
    return {
      title: '보보쇼즈 중고 - 입히고',
      description: '입히고에서 보보쇼즈 중고 아동복을 만나보세요.',
      keywords: ['보보쇼즈 중고', '아동 빈티지', '수입 아동복', '입히고'],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
  if (brand === '미니로디니') {
    return {
      title: '미니로디니 중고 - 입히고',
      description: '입히고에서 미니로디니 중고 아동복을 만나보세요.',
      keywords: ['미니로디니 중고', '아동 빈티지', '수입 아동복', '입히고'],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
  if (brand === '던스') {
    return {
      title: '던스 중고 - 입히고',
      description: '입히고에서 던스 중고 아동복을 만나보세요.',
      keywords: ['던스 중고', '아동 빈티지', '수입 아동복', '입히고'],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
  if (brand === '아폴리나') {
    return {
      title: '아폴리나 중고 - 입히고',
      description: '입히고에서 아폴리나 중고 아동복을 만나보세요.',
      keywords: ['아폴리나 중고', '아동 빈티지', '수입 아동복', '입히고'],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
  if (brand === '루이스미샤') {
    return {
      title: '루이스미샤 중고 - 입히고',
      description: '입히고에서 루이스미샤 중고 아동복을 만나보세요.',
      keywords: ['루이스미샤 중고', '아동 빈티지', '수입 아동복', '입히고'],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
  if (brand === '봉주르다이어리') {
    return {
      title: '봉주르다이어리 중고 - 입히고',
      description: '입히고에서 봉주르다이어리 중고 아동복을 만나보세요.',
      keywords: ['봉주르다이어리 중고', '아동 빈티지', '수입 아동복', '입히고'],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
  if (brand === '타오') {
    return {
      title: '타오 중고 - 입히고',
      description: '입히고에서 타오 중고 아동복을 만나보세요.',
      keywords: ['타오 중고', '아동 빈티지', '수입 아동복', '입히고'],
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {
    title: '중고 아동복 모음 - 입히고',
    description: '입히고에서 다양한 수입 아동복 중고 상품을 만나보세요.',
    keywords: ['보보쇼즈 중고', '미니로디니 중고', '아동 빈티지', '수입 아동복', '입히고'],
    alternates: {
      canonical: canonicalUrl,
    },
  };
}


export default function ProductsPage() {
  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <ProductListPage />
    </Suspense>
  );
}

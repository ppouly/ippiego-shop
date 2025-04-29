'use client';

interface IppiegoSizeTableProps {
  selectedSize?: string;
  brand?: string;
}

interface BrandCommentProps {
  brand: string;
}

const brandComments: Record<string, { comment: string; adjusted: boolean }> = {
  '미니로디니': { comment: '표준 핏입니다. 정사이즈 선택을 추천드립니다.', adjusted: false },
  '보보쇼즈': { comment: '오버핏 경향이 있어, 한 사이즈 작게 선택하는 경우가 많습니다.', adjusted: true },
  '루이스미샤': { comment: '슬림핏 제품이 많아 체형에 따라 반 사이즈 업을 추천드립니다.', adjusted: true },
  '아폴리나': { comment: '여유 있는 플로우 핏입니다. 정사이즈 선택을 추천드립니다.', adjusted: false },
  '던스': { comment: '크게 나오는 편이라 한 사이즈 작게 선택하는 경우가 많습니다.', adjusted: true },
  '타오': { comment: '제품별 핏 차이가 크므로 상세 사진 확인을 권장합니다.', adjusted: false },
  '봉주르다이어리': { comment: '루즈핏 경향이 있습니다. 체형에 따라 선택해주세요.', adjusted: false },
  '콩제슬래드': { comment: '크게 나오는 편입니다. 한 사이즈 작게 선택하는 경우가 많습니다.', adjusted: true },
};

const brandToColumn: Record<string, string> = {
  '미니로디니': '미니로디니',
  '보보쇼즈': '보보쇼즈 (한사이즈 작게표기)',
  '루이스미샤': '루이스미샤 (반사이즈 크게표기)',
  '아폴리나': '아폴리나',
  '던스': '던스 (한사이즈 작게표기)',
  '타오': '타오 (TAO)',
  '봉주르다이어리': '봉주르다이어리',
  '콩제슬래드': '콩제슬래드 (한사이즈 작게표기)',
};

export function BrandComment({ brand }: BrandCommentProps) {
  const info = brandComments[brand];
  if (!info) return null;

  return (
    <div className="mt-4 text-xs text-gray-600">
      📢 {info.comment}
      {info.adjusted && <><br />🎯 이 특성을 반영하여 IPPIEGO 사이즈표에 표기하였습니다.</>}
    </div>
  );
}

export default function IppiegoSizeTable({ selectedSize, brand }: IppiegoSizeTableProps) {
  const highlightRow = (size: string) =>
    selectedSize === size ? 'bg-orange-100 font-bold text-orange-600' : 'hover:bg-gray-50';

  const columnHeaders = [
    'IPPIEGO 사이즈', '키 기준(cm)', '나이 기준',
    '미니로디니', '보보쇼즈 (한사이즈 작게표기)', '루이스미샤 (반사이즈 크게표기)', '아폴리나',
    '던스 (한사이즈 작게표기)', '타오 (TAO)', '봉주르다이어리', '콩제슬래드 (한사이즈 작게표기)',
  ];

  const targetColumnName = brand ? brandToColumn[brand] : '';
  const targetColumnIndex = columnHeaders.indexOf(targetColumnName);

  const rows = [
    { size: '70', height: '68–74', age: '6–9개월', mini: '68/74', bobo: '-', louise: '-', apolina: '-', duns: '50/56', tao: '-', bonjour: '6M', konges: '6M' },
    { size: '80', height: '80–86', age: '12–18개월', mini: '80/86', bobo: '6-12M', louise: '18M', apolina: '-', duns: '62/68', tao: '-', bonjour: '12M', konges: '12M' },
    { size: '90', height: '86–92', age: '18–24개월', mini: '92/98', bobo: '12-18M', louise: '2Y', apolina: '-', duns: '74/80', tao: '-', bonjour: '18M–24M', konges: '18M' },
    { size: '100', height: '92–98', age: '2–3세', mini: '92/98', bobo: '18-24M', louise: '3Y–4Y', apolina: '2-3Y', duns: '86/92', tao: '2Y', bonjour: '2Y', konges: '2Y' },
    { size: '110', height: '104–110', age: '4–5세', mini: '104/110', bobo: '2-3Y', louise: '5Y', apolina: '3-5Y', duns: '98/104', tao: '4Y', bonjour: '3Y–4Y', konges: '4Y' },
    { size: '120', height: '116–122', age: '6–7세', mini: '116/122', bobo: '4-5Y', louise: '7Y–8Y', apolina: '5-7Y', duns: '110/116', tao: '6Y', bonjour: '6Y', konges: '5-6Y' },
    { size: '130', height: '128–134', age: '8–9세', mini: '128/134', bobo: '6-7Y', louise: '9Y–10Y', apolina: '7-9Y', duns: '122/128', tao: '8Y', bonjour: '8Y', konges: '7-8Y' },
    { size: '140', height: '140–146', age: '10–11세', mini: '140/146', bobo: '8-9Y', louise: '11Y–12Y', apolina: '9Y+', duns: '134/140', tao: '10Y', bonjour: '10Y', konges: '9-10Y' },
  ];

  return (
   <> 
 
      {/* ✅ BrandComment는 바깥에서 독립 */}
      {brand && (
        <div className="mt-4 mb-6">
          <BrandComment brand={brand} />
        </div>
      )}

    <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200">

      <table className="min-w-[1200px] text-sm text-center text-gray-700">
        <thead className="bg-gray-50 text-xs uppercase font-semibold">
          <tr>
            {columnHeaders.map((header, index) => (
              <th key={header} className={`px-4 py-3 ${index === targetColumnIndex ? 'text-orange-500' : ''}`}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.size} className={highlightRow(row.size)}>
              <td className="px-4 py-3">{row.size}</td>
              <td className="px-4 py-3">{row.height}</td>
              <td className="px-4 py-3">{row.age}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 3 ? 'text-orange-500 font-bold' : ''}`}>{row.mini}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 4 ? 'text-orange-500 font-bold' : ''}`}>{row.bobo}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 5 ? 'text-orange-500 font-bold' : ''}`}>{row.louise}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 6 ? 'text-orange-500 font-bold' : ''}`}>{row.apolina}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 7 ? 'text-orange-500 font-bold' : ''}`}>{row.duns}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 8 ? 'text-orange-500 font-bold' : ''}`}>{row.tao}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 9 ? 'text-orange-500 font-bold' : ''}`}>{row.bonjour}</td>
              <td className={`px-4 py-3 ${targetColumnIndex === 10 ? 'text-orange-500 font-bold' : ''}`}>{row.konges}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>

    </>
  );
}

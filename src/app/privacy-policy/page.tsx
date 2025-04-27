"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="p-6 text-gray-800 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">개인정보처리방침</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">1. 수집하는 개인정보 항목</h2>
        <p>회사는 회원가입, 주문 및 배송, 고객상담 등을 위해 다음의 개인정보를 수집합니다.</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>필수항목: 닉네임, 주소, 휴대전화번호</li>
          <li>선택항목: 이메일 주소, 프로필 사진</li>
        </ul>
        <p className="mt-2">※ 서비스 이용 과정에서 결제정보(신용카드, 계좌정보 등)가 추가로 수집될 수 있습니다.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. 개인정보 수집 및 이용 목적</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>주문 상품 배송 및 관련 서비스 제공</li>
          <li>회원관리 및 본인확인</li>
          <li>고객상담 및 불만처리</li>
          <li>서비스 이용에 따른 정보 제공 및 고지사항 전달</li>
          <li>(선택 동의 시) 마케팅 및 광고 활용</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. 개인정보 보유 및 이용기간</h2>
        <p>개인정보 수집 및 이용목적이 달성된 후에는 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관할 수 있습니다.</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. 개인정보의 제3자 제공</h2>
        <p>회사는 이용자의 개인정보를 수집 및 이용목적 범위 내에서만 사용하며, 별도의 동의 없이 제3자에게 제공하지 않습니다. 단, 법령에 특별한 규정이 있는 경우는 예외로 합니다.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. 개인정보 처리위탁</h2>
        <p>회사는 서비스 제공을 위해 필요한 경우 최소한의 범위에서 외부 전문업체에 위탁할 수 있으며, 위탁 시 사전에 고지하거나 동의를 받습니다.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. 이용자 및 법정대리인의 권리와 행사방법</h2>
        <p>이용자 및 법정대리인은 언제든지 등록된 개인정보를 조회하거나 수정할 수 있으며, 회원탈퇴를 통해 개인정보 처리정지를 요청할 수 있습니다.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. 개인정보 보호책임자</h2>
        <p>회사는 개인정보 보호책임자를 지정하여 이용자의 개인정보 보호를 총괄하고 있습니다.</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>책임자: 백수정</li>
          <li>이메일: sujungbaik@gmail.com</li>
          <li>연락처: 010-5470-9225</li>
        </ul>
      </section>

      <p className="text-sm text-gray-500 mt-8">본 개인정보처리방침은 2024년 5월 1일부터 적용됩니다.</p>
    </div>
  );
}

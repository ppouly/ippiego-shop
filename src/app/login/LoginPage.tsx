"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [agreeNickname, setAgreeNickname] = useState(false);
  const [agreeAddressPhone, setAgreeAddressPhone] = useState(false);
  const [agreeEmail, setAgreeEmail] = useState(false);
  const [agreeProfileImage, setAgreeProfileImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleKakaoLogin = async () => {
    if (!agreeNickname || !agreeAddressPhone) {
      setErrorMessage("필수 동의 항목을 모두 체크해 주세요.");
      return;
    }
  
    setErrorMessage("");
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });
  
    if (error) {
      console.error("카카오 로그인 실패:", error.message);
      setErrorMessage("카카오 로그인에 실패했습니다. 다시 시도해 주세요.");
      return;
    }
  
    // ✅ 로그인 성공하면 유저 정보 가져오기
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("사용자 정보 조회 실패:", userError?.message);
      return;
    }
  
    const { id, user_metadata } = userData.user;
    const kakaoId = id;
    const nickname = user_metadata?.nickname || "";
    const email = user_metadata?.email || null;
    const profileImage = user_metadata?.picture || null;
  
    // ✅ Supabase users 테이블에 저장
    const { error: insertError } = await supabase.from("users").upsert(
      {
        id: kakaoId, // user ID를 primary key로
        nickname,
        email: agreeEmail ? email : null, // 선택 동의했을 때만 저장
        profile_image: agreeProfileImage ? profileImage : null, // 선택 동의했을 때만 저장
        agree_email: agreeEmail,
        agree_profile_image: agreeProfileImage,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" } // 같은 id가 있으면 update
    );
  
    if (insertError) {
      console.error("회원정보 저장 실패:", insertError.message);
      return;
    }
  
    console.log("✅ 회원정보 저장 완료");
  };
  

  return (
    <div className="p-4 space-y-6 text-[15px] text-gray-800">
      <h1 className="text-lg font-semibold text-gray-900">회원가입 및 로그인</h1>

      {/* 필수 동의 */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <input
            id="agreeNickname"
            type="checkbox"
            checked={agreeNickname}
            onChange={(e) => setAgreeNickname(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeNickname" className="text-sm text-gray-700">
            [필수] 닉네임 수집 및 이용 동의 (주문, 배송, 식별 목적)
          </label>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="agreeAddressPhone"
            type="checkbox"
            checked={agreeAddressPhone}
            onChange={(e) => setAgreeAddressPhone(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeAddressPhone" className="text-sm text-gray-700">
            [필수] 주소 및 전화번호 수집 및 이용 동의 (배송 목적)
          </label>
        </div>
      </div>

      {/* 선택 동의 */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-start gap-2">
          <input
            id="agreeEmail"
            type="checkbox"
            checked={agreeEmail}
            onChange={(e) => setAgreeEmail(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeEmail" className="text-sm text-gray-700">
            [선택] 이메일 수집 및 이용 동의 (계정 관리, 주문 알림)
          </label>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="agreeProfileImage"
            type="checkbox"
            checked={agreeProfileImage}
            onChange={(e) => setAgreeProfileImage(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agreeProfileImage" className="text-sm text-gray-700">
            [선택] 프로필 이미지 수집 및 이용 동의 (프로필 표시 목적)
          </label>
        </div>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="text-red-600 text-sm">{errorMessage}</div>
      )}

      <button
        type="button"
        onClick={handleKakaoLogin}
        disabled={!agreeNickname || !agreeAddressPhone}
        className={`w-full py-3 mt-4 border rounded text-center font-semibold transition ${
          agreeNickname && agreeAddressPhone
            ? "bg-yellow-300 hover:bg-yellow-400"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        카카오로 로그인하기
      </button>
      <p className="text-xs text-orange-800">카카오 회원가입 서비스 준비 중 입니다.</p>
    </div>
  );
}







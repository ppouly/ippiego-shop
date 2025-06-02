"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
}

export default function ReviewWriteClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [product, setProduct] = useState<Product | null>(null);
  const [existingReviewId, setExistingReviewId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [nickname, setNickname] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resizeImage = (
    file: File,
    maxWidth: number = 1024,
    quality: number = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement("img");
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const width = img.width * scale;
          const height = img.height * scale;

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context error"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("이미지 압축 실패"));
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ✅ 상품 및 기존 리뷰 불러오기
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const { data: tokenData } = await supabase
        .from("reviews_tokens")
        .select("product_id")
        .eq("token", token)
        .maybeSingle();

      if (!tokenData) return;

      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("id", tokenData.product_id)
        .maybeSingle();

      setProduct(productData);

      const { data: existingReview } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", tokenData.product_id)
        .maybeSingle();

      if (existingReview) {
        setExistingReviewId(existingReview.id);
        setContent(existingReview.content || "");
        setRating(existingReview.rating || 5);
        setNickname(existingReview.nickname || "");
        setPreviewUrl(existingReview.image_url || null);
      }
    };
    fetchData();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateReview = async () => {
    if (!product || !existingReviewId) return;

    let imageUrl = previewUrl;

    if (imageFile) {
      const safeName = imageFile.name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.-]/g, "")
        .toLowerCase();
      const fileName = `${Date.now()}_${safeName}`;

      const resizedBlob = await resizeImage(imageFile, 1024, 0.8);
      const resizedFile = new File([resizedBlob], fileName, {
        type: "image/jpeg",
      });

      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(fileName, resizedFile, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        setErrorMessage("이미지 업로드 실패");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("review-images")
        .getPublicUrl(fileName);

      imageUrl = urlData?.publicUrl ?? null;
    }

    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        content,
        rating,
        nickname,
        image_url: imageUrl,
      })
      .eq("id", existingReviewId);

    if (updateError) {
      setErrorMessage("리뷰 수정 실패");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setSuccessMessage("리뷰가 수정되었습니다!");
    setTimeout(() => {
      setSuccessMessage("");
      router.push("/");
    }, 3000);
  };

  const handleDeleteReview = async () => {
    if (!existingReviewId) return;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", existingReviewId);

    if (error) {
      setErrorMessage("리뷰 삭제 실패");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setContent("");
    setRating(5);
    setNickname("");
    setPreviewUrl(null);
    setExistingReviewId(null);

    setSuccessMessage("리뷰가 삭제되었습니다!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (!product) return <p className="p-4">불러오는 중...</p>;

  return (
    <div className="p-4 space-y-4">
      {(errorMessage || successMessage) && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-md text-sm font-medium transition-all duration-300
          ${errorMessage ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}
        >
          {errorMessage || successMessage}
        </div>
      )}

      <Image
        src={`/products/${product.id}/main.jpg`}
        width={600}
        height={400}
        alt="product"
        className="rounded-xl"
      />

      <input
        type="text"
        placeholder="닉네임 (선택)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full border rounded-md p-2"
      />

      <textarea
        placeholder="후기를 남겨주세요 :)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded-xl p-4 h-40 resize-none"
      />

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-gray-500">({rating}점)</span>
      </div>

      <div className="space-y-2">
        <label className="block w-full text-center bg-gray-100 border border-dashed border-gray-400 rounded-lg py-3 cursor-pointer hover:bg-gray-200">
          사진 올리기
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>


      {/* ✅ 여기에 안내 문구 추가 */}
      <p className="text-xs text-gray-500 text-center">*사진은 한 장만 업로드 가능합니다.</p>


        {previewUrl && (
          <Image
            src={previewUrl}
            alt="리뷰 이미지 미리보기"
            width={600}
            height={300}
            className="w-full h-48 object-cover rounded-xl border"
            unoptimized
          />
        )}
      </div>

      {existingReviewId ? (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleUpdateReview}
            className="flex-1 bg-blue-500 text-white rounded-xl py-2 font-medium"
          >
            리뷰 수정하기
          </button>
          <button
            onClick={handleDeleteReview}
            className="flex-1 bg-red-500 text-white rounded-xl py-2 font-medium"
          >
            리뷰 삭제하기
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500 font-medium">
          작성된 리뷰가 없습니다.
        </p>
      )}
    </div>
  );
}

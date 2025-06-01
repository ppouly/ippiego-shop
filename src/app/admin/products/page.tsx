"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns-tz";
import { useRouter } from "next/navigation";

const statusOptions = ["판매중", "판매완료", "판매준비"];
const sizeOptions = ["70", "85", "95", "110", "120", "130", "140"];
const conditionOptions = ["New", "S", "A", "B", "C"];
const brandOptions = [
  "보보쇼즈", "미니로디니", "타오", "봉주르다이어리",
  "루이스미샤", "아폴리나", "던스", "타이니코튼", "콩제슬래드",
  "직접입력"
];
const seasonOptions = ["SS", "FW"];
const category1Options = ["아우터", "상의", "하의", "원피스", "셋업", "스윔수트", "모자신발"];

interface Product {
    id?: number;
    name: string;
    status?: string;
    createdAt?: string;
    size?: string;
    brandSize?: string;
    conditionGrade: string;
    brand: string;
    category1: string;
    category2: string;
    purchasePrice: number;
    price: number;
    discountRate: number;
    colors: string;
    shape: string;
    season: string;
    description: string;
  }

  // 🔧 여기에 추가
type NewProductInput = Partial<Product> & {
    desc1?: string;
    desc2?: string;
  };

export default function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editedProducts, setEditedProducts] = useState<Record<number, Partial<Product>>>({});
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState<NewProductInput | null>(null);
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (isAuth !== "true") {
      router.push("/admin/auth");
    }
  }, [router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, status, createdAt, size, brandSize, conditionGrade")
      .order("createdAt", { ascending: false });

    if (!error && data) {
      const converted = data.map((p) => ({
        ...p,
        createdAt: format(new Date(p.createdAt), "yyyy-MM-dd HH:mm:ss", {
          timeZone: "Asia/Seoul",
        }),
      })) as Product[];
      setProducts(converted);
    }
  };

  const handleEditChange = (id: number, field: keyof Product, value: string) => {
    setEditedProducts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: number) => {
    const updates = editedProducts[id];
    if (!updates) return;

    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);

    if (!error) {
      fetchProducts();
      setEditedProducts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      alert("업데이트 실패: " + error.message);
    }
  };

  const handleNewChange = (field: keyof Product, value: string | number) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleInsert = async () => {
    if (!newProduct?.name) {
      alert("상품명을 입력해주세요.");
      return;
    }
  
    // 카테고리 자동 생성
    const categoryArray =
      newProduct.category1 === "셋업"
        ? ["셋업", "상의", "하의"]
        : [newProduct.category1 ?? ""];
  
    // 🔧 안전하게 불필요 필드 제거 (id, desc1, desc2, description)
    const { desc1, desc2 } = newProduct;

    const productToInsert = {
      name: newProduct.name,
      brand: newProduct.brand,
      category2: newProduct.category2,
      purchasePrice: newProduct.purchasePrice,
      price: newProduct.price,
      discountRate: newProduct.discountRate ?? 0,
      colors: newProduct.colors,
      conditionGrade: newProduct.conditionGrade,
      shape: newProduct.shape,
      season: newProduct.season,
      category1: newProduct.category1,
      category: categoryArray,
      description: "",
    };
    
  
  
    // 🔐 insert + select("id") 로 id 획득
    const { error: insertError } = await supabase
    .from("products")
    .insert([productToInsert])
    .select("id");
  
  if (insertError) {
    alert("삽입 실패: " + insertError.message);
    return;
  }
  
 

    // 🔻 이후에 다시 id 조회
    const { data: latestData } = await supabase
    .from("products")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

    const newId = latestData?.[0]?.id;
  
    // 📦 description 생성
    const finalDescription = `
  <h2 style="font-size: 17px;font-weight: 700;letter-spacing: -0.3px;color: #222;margin-bottom: 12px;padding-left: 16px;padding-right: 16px;text-align: left;font-family: 'SUIT', 'Pretendard', 'Apple SD Gothic Neo', sans-serif;">ippie go! 코멘트</h2>
  <p style="font-size: 14px;font-weight: 500;line-height: 1.75;color: #444;padding-left: 16px;padding-right: 16px;text-align: left;font-family: 'SUIT', 'Pretendard', 'Apple SD Gothic Neo', sans-serif;">
  ${desc1?.replace(/\n/g, "<br>") ?? ""}
  </p><br>
  ${desc2 ?? ""}
  <br>
  <div style="padding: 0 16px;">
    <img src="/products/${newId}/main.jpg" alt="상세이미지1" style="width: 100%; margin-bottom: 16px; border-radius: 8px;"><br>
    <br><img src="/products/${newId}/detail1.jpg" alt="상세이미지2" style="width: 100%; border-radius: 8px;">  
    <br><img src="/products/${newId}/detail2.jpg" alt="상세이미지3" style="width: 100%; border-radius: 8px;">
    <br><img src="/products/${newId}/detail3.jpg" alt="상세이미지4" style="width: 100%; border-radius: 8px;">
    <br><img src="/products/${newId}/brand1.jpg" alt="브랜드이미지1" style="width: 100%; border-radius: 8px;"><br>
  </div>
  `;
  
    // ✅ description 및 이미지 경로 업데이트
    const { error: updateError } = await supabase
      .from("products")
      .update({
        description: finalDescription,
        image: `/products/${newId}/main.jpg`,
        pkg_image: `/products/${newId}/pkg.jpg`,
        image_model: `/products/${newId}/detail3.jpg`,
      })
      .eq("id", newId);
  
    if (updateError) {
      alert("description 업데이트 실패: " + updateError.message);
      return;
    }
  
    await fetchProducts();
    setNewProduct(null);
    alert("상품이 성공적으로 등록되었습니다!");
  };
  
  

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="상품명 검색"
          className="border p-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() =>
            setNewProduct({
              name: "",
              brand: "",
              category2: "",
              purchasePrice: 0,
              price: 0,
              colors: "",
              conditionGrade: "New",
              description: "",
              discountRate: 0,
              shape: "",
              season: "SS",
              category1: "상의",
            })
          }
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
        >
          신규 상품 추가
        </button>
      </div>

      {newProduct && (
  <div className="border p-4 mb-4 text-sm space-y-2 bg-gray-50">
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">상품명</label>
        <input className="border p-1" value={newProduct.name} onChange={(e) => handleNewChange("name", e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">브랜드</label>
        <select className="border p-1" value={newProduct.brand} onChange={(e) => handleNewChange("brand", e.target.value)}>
          {brandOptions.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">카테고리1</label>
        <select className="border p-1" value={newProduct.category1} onChange={(e) => handleNewChange("category1", e.target.value)}>
          {category1Options.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">카테고리2</label>
        <input className="border p-1" value={newProduct.category2} onChange={(e) => handleNewChange("category2", e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">매입가</label>
        <input type="number" className="border p-1" value={newProduct.purchasePrice} onChange={(e) => handleNewChange("purchasePrice", Number(e.target.value))} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">판매가</label>
        <input type="number" className="border p-1" value={newProduct.price} onChange={(e) => handleNewChange("price", Number(e.target.value))} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">할인율(%)</label>
        <input type="number" className="border p-1" value={newProduct.discountRate} onChange={(e) => handleNewChange("discountRate", Number(e.target.value))} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">컬러</label>
        <input className="border p-1" value={newProduct.colors} onChange={(e) => handleNewChange("colors", e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">상품 상태</label>
        <select className="border p-1" value={newProduct.conditionGrade} onChange={(e) => handleNewChange("conditionGrade", e.target.value)}>
          {conditionOptions.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">핏(모양)</label>
        <input className="border p-1" value={newProduct.shape} onChange={(e) => handleNewChange("shape", e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">시즌</label>
        <select className="border p-1" value={newProduct.season} onChange={(e) => handleNewChange("season", e.target.value)}>
          {seasonOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex flex-col col-span-3">
        <label className="text-xs text-gray-500 mb-1">간단설명</label>
        <input className="border p-1" value={newProduct.desc1 ?? ""} onChange={(e) => handleNewChange("desc1" as keyof Product, e.target.value)} />
      </div>
      <div className="flex flex-col col-span-3">
        <label className="text-xs text-gray-500 mb-1">추가설명</label>
        <textarea className="border p-1" rows={3} value={newProduct.desc2 ?? ""} onChange={(e) => handleNewChange("desc2" as keyof Product, e.target.value)} />
      </div>
    </div>

    {/* 미리보기 */}
    <div className="mt-4 p-2 bg-white border rounded text-xs whitespace-pre-wrap font-mono">
      {JSON.stringify({
        ...newProduct,
        description: `${newProduct.desc1 ?? ""}\n${newProduct.desc2 ?? ""}`,
        category: newProduct.category1 === "셋업"
          ? ["셋업", "상의", "하의"]
          : [newProduct.category1],
        image: `/products/미정/main.jpg`,
        pkg_image: `/products/미정/pkg.jpg`,
        image_model: `/products/미정/detail3.jpg`,
      }, null, 2)}
    </div>

    <button onClick={handleInsert} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
      등록하기
    </button>
  </div>
)}

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">저장</th>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Size</th>
            <th className="border p-2">Brand Size</th>
            <th className="border p-2">Condition</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => {
            const isEdited = !!editedProducts[product.id!];
            return (
              <tr key={product.id} className="text-center">
                <td className="border p-2">
                  <button
                    onClick={() => handleSave(product.id!)}
                    disabled={!isEdited}
                    className={`px-3 py-1 rounded text-white ${isEdited ? "bg-green-500" : "bg-gray-300 cursor-not-allowed"}`}
                  >
                    저장
                  </button>
                </td>
                <td className="border p-2">{product.id}</td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">
                  <select
                    value={editedProducts[product.id!]?.status ?? product.status ?? ""}
                    onChange={(e) => handleEditChange(product.id!, "status", e.target.value)}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    className="w-full border px-1"
                    value={editedProducts[product.id!]?.createdAt ?? product.createdAt ?? ""}
                    onChange={(e) => handleEditChange(product.id!, "createdAt", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <select
                    value={editedProducts[product.id!]?.size ?? product.size ?? ""}
                    onChange={(e) => handleEditChange(product.id!, "size", e.target.value)}
                  >
                    {sizeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  <input
                    className="w-full border px-1"
                    value={editedProducts[product.id!]?.brandSize ?? product.brandSize ?? ""}
                    onChange={(e) => handleEditChange(product.id!, "brandSize", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <select
                    value={editedProducts[product.id!]?.conditionGrade ?? product.conditionGrade ?? ""}
                    onChange={(e) => handleEditChange(product.id!, "conditionGrade", e.target.value)}
                  >
                    {conditionOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

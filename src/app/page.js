"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./lib/firebase";
import {
  Package,
  PlusCircle,
  FileClock,
  Plus,
  Minus,
  Pencil,
  Trash2,
} from "lucide-react";
import CategoryModal from "@/components/CategoryModal";
import CreateProductModal from "@/components/CreateProductModal";
import EditProductModal from "@/components/EditProductModal";
import SearchFilter from "@/components/SearchFilter";

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = products.filter((product) => {
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "" || product.categoryId === category;
    return matchesSearch && matchesCategory;
  });

  const handleIncrease = async (id) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      const ref = doc(db, "products", id);
      await updateDoc(ref, { quantity: product.quantity + 1, updatedAt: Timestamp.now() });
      await logHistory({ productId: id, productName: product.name, action: "add", amount: 1 });
    }
  };

  const handleDecrease = async (id) => {
    const product = products.find((p) => p.id === id);
    if (product && product.quantity > 0) {
      const ref = doc(db, "products", id);
      await updateDoc(ref, { quantity: product.quantity - 1, updatedAt: Timestamp.now() });
      await logHistory({ productId: id, productName: product.name, action: "remove", amount: 1 });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("คุณแน่ใจว่าต้องการลบสินค้านี้?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const logHistory = async ({ productId, productName, action, amount }) => {
    await addDoc(collection(db, "history"), {
      productId,
      productName,
      action,
      amount,
      timestamp: Timestamp.now(),
    });
  };

  return (
    <>
      <CategoryModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
      <CreateProductModal isOpen={showProductModal} onClose={() => setShowProductModal(false)} />
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditProduct(null);
        }}
        product={editProduct}
      />

      <div className="flex min-h-screen">
        <aside className="w-64 bg-blue-900 text-white p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">📦 Stock Menu</h2>
          <button onClick={() => setShowProductModal(true)} className="w-full flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded">
            <Plus className="w-5 h-5" /> <span>เพิ่มสินค้า</span>
          </button>
          <button onClick={() => setShowCategoryModal(true)} className="w-full flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2 rounded">
            <PlusCircle className="w-5 h-5" /> <span>เพิ่มหมวดหมู่</span>
          </button>
          <button onClick={() => router.push("/history")} className="w-full flex items-center gap-2 bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded">
            <FileClock className="w-5 h-5" /> <span>ประวัติการทำรายการ</span>
          </button>
        </aside>

        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-700" /> รายการสินค้า
          </h1>

          <SearchFilter search={search} setSearch={setSearch} category={category} setCategory={setCategory} />

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(115vh-280px)]">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-200 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">รูปสินค้า</th>
                    <th className="px-4 py-3 text-left font-semibold">ชื่อสินค้า</th>
                    <th className="px-4 py-3 text-left font-semibold">จำนวน</th>
                    <th className="px-4 py-3 text-left font-semibold">อัปเดตล่าสุด</th>
                    <th className="px-4 py-3 text-left font-semibold">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b animate-pulse">
                        <td className="px-4 py-3"><div className="w-16 h-16 bg-gray-200 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/3" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-2/3" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center px-4 py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="w-12 h-12 text-gray-300" />
                          <span>ไม่พบสินค้าที่ค้นหา</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2">
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      className="w-16 h-16 object-cover rounded"
      loading="lazy"
    />
  ) : (
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">ไม่มีรูป</span>
                            </div>
  )}
</td>
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.quantity > 10
                              ? "bg-green-100 text-green-800"
                              : product.quantity > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {product.updatedAt?.toDate().toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }) ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => handleIncrease(product.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
                              <Plus className="w-3 h-3" /> เพิ่ม
                            </button>
                            <button onClick={() => handleDecrease(product.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
                              <Minus className="w-3 h-3" /> เบิก
                            </button>
                            <button onClick={() => { setEditProduct(product); setShowEditModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
                              <Pencil className="w-3 h-3" /> แก้ไข
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
                              <Trash2 className="w-3 h-3" /> ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

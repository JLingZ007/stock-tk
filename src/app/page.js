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
  TrendingUp,
  AlertTriangle,
  BarChart3,
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

  // Statistics for dashboard overview
  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.quantity <= 5).length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.quantity || 0), 0)
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

      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Enhanced Sidebar */}
        <aside className="w-72 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 text-white shadow-2xl">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Stock Management
              </h2>
            </div>
            <p className="text-slate-400 text-sm">ระบบจัดการคลังสินค้า</p>
          </div>

          {/* Stats Summary in Sidebar */}
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              สถิติรวม
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-slate-300 text-sm">สินค้าทั้งหมด</span>
                <span className="text-blue-400 font-bold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-slate-300 text-sm">สต็อกต่ำ</span>
                <span className="text-amber-400 font-bold">{stats.lowStock}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-slate-300 text-sm">หมดสต็อก</span>
                <span className="text-red-400 font-bold">{stats.outOfStock}</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-6 space-y-3">
            <button 
              onClick={() => setShowProductModal(true)} 
              className="group w-full flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:shadow-xl"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /> 
              <span>เพิ่มสินค้าใหม่</span>
            </button>
            
            <button 
              onClick={() => setShowCategoryModal(true)} 
              className="group w-full flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-600/40 hover:shadow-xl"
            >
              <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /> 
              <span>จัดการหมวดหมู่</span>
            </button>
            
            <button 
              onClick={() => router.push("/history")} 
              className="group w-full flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:shadow-xl"
            >
              <FileClock className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /> 
              <span>ประวัติการทำรายการ</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {/* Enhanced Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" /> 
              รายการสินค้าในคลัง
            </h1>
          </div>

          {/* Enhanced Search Filter */}
          <div className="mb-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 pb-0 shadow-sm border border-slate-200/50">
              <SearchFilter 
                search={search} 
                setSearch={setSearch} 
                category={category} 
                setCategory={setCategory} 
              />
            </div>
          </div>

          {/* Enhanced Table Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(150vh-400px)]">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gradient-to-r from-slate-100 to-blue-100/50 text-slate-700 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold border-b border-slate-200">รูปสินค้า</th>
                    <th className="px-6 py-4 text-left font-semibold border-b border-slate-200">ชื่อสินค้า</th>
                    <th className="px-6 py-4 text-left font-semibold border-b border-slate-200">จำนวนคงเหลือ</th>
                    <th className="px-6 py-4 text-left font-semibold border-b border-slate-200">อัปเดตล่าสุด</th>
                    <th className="px-6 py-4 text-left font-semibold border-b border-slate-200">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-200 animate-pulse">
                        <td className="px-6 py-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 bg-slate-200 rounded-lg w-3/4 mb-2" />
                          <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-slate-200 rounded-full w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <div className="h-8 bg-slate-200 rounded-lg w-16" />
                            <div className="h-8 bg-slate-200 rounded-lg w-16" />
                            <div className="h-8 bg-slate-200 rounded-lg w-16" />
                            <div className="h-8 bg-slate-200 rounded-lg w-16" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center px-6 py-16 text-slate-500">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-slate-100/50 rounded-full">
                            <Package className="w-16 h-16 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">ไม่พบสินค้าที่ค้นหา</h3>
                            <p className="text-slate-500">ลองเปลี่ยนคำค้นหาหรือปรับตัวกรองใหม่</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product, index) => (
                      <tr key={product.id} className={`border-b border-slate-200 hover:bg-slate-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'}`}>
                        <td className="px-6 py-4">
                          <div className="relative">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center shadow-sm">
                                <Package className="w-8 h-8 text-slate-400" />
                              </div>
                            )}
                            
                            {/* Quick Stock Indicator */}
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              product.quantity > 10 ? 'bg-green-500' : 
                              product.quantity > 0 ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <h3 className="font-semibold text-slate-800 mb-1">{product.name}</h3>
                            
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold ${
                              product.quantity > 10
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : product.quantity > 0
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}>
                              {product.quantity}
                              <span className="ml-1 text-xs opacity-75">ชิ้น</span>
                            </span>
                            
                            {product.quantity <= 5 && product.quantity > 0 && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {product.quantity === 0 && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-slate-600">
                          <div className="bg-slate-50 px-2 py-1 rounded-lg text-xs">
                            {product.updatedAt?.toDate().toLocaleString("th-TH", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }) ?? "-"}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            <button 
                              onClick={() => handleIncrease(product.id)} 
                              className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Plus className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" /> 
                              เพิ่ม
                            </button>
                            
                            <button 
                              onClick={() => handleDecrease(product.id)} 
                              disabled={product.quantity <= 0}
                              className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
                            >
                              <Minus className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" /> 
                              เบิก
                            </button>
                            
                            <button 
                              onClick={() => { setEditProduct(product); setShowEditModal(true); }} 
                              className="group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Pencil className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" /> 
                              แก้ไข
                            </button>
                            
                            <button 
                              onClick={() => handleDelete(product.id)} 
                              className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" /> 
                              ลบ
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
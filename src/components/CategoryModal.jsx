'use client';
import { useEffect, useState } from 'react';
import { db } from '../app/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { X, Trash2, Edit3, Plus, Save } from 'lucide-react';

export default function CategoryModal({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.name.localeCompare(b.name, 'th', { sensitivity: 'base' }));
      setCategories(data);
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    await addDoc(collection(db, 'categories'), { name: newCategory.trim() });
    setNewCategory('');
  };

  const handleEdit = async () => {
    if (!newCategory.trim()) return;
    await updateDoc(doc(db, 'categories', editingId), { name: newCategory.trim() });
    setEditingId(null);
    setNewCategory('');
  };

  const handleDelete = async (id) => {
    if (confirm('คุณต้องการลบหมวดหมู่นี้หรือไม่?')) {
      await deleteDoc(doc(db, 'categories', id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewCategory('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            จัดการหมวดหมู่
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add/Edit Form */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editingId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="กรอกชื่อหมวดหมู่..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (editingId ? handleEdit() : handleAdd())}
              />
              <div className="flex gap-1">
                {editingId ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      บันทึก
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-3 rounded-lg transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAdd}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่ม
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              รายการหมวดหมู่ ({categories.length} หมวดหมู่)
            </h3>
            <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>ยังไม่มีหมวดหมู่</p>
                  <p className="text-xs mt-1">เพิ่มหมวดหมู่แรกของคุณ</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-800">{cat.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setNewCategory(cat.name);
                          }}
                          className="text-gray-400 hover:text-blue-500 p-2 rounded-md hover:bg-blue-50 transition-all"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-all"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
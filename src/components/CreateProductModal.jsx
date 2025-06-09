'use client';
import { useEffect, useState } from 'react';
import { db } from '../app/lib/firebase';
import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { X, Plus, Upload } from 'lucide-react';
import { uploadToCloudinary } from '../app/lib/uploadToCloudinary';

export default function CreateProductModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.name.localeCompare(b.name, 'th', { sensitivity: 'base' }));
      setCategories(data);
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
        return;
      }
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) {
      alert('กรุณากรอกชื่อสินค้าและเลือกหมวดหมู่');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'products'), {
        name: name.trim(),
        quantity,
        detail: description.trim(),
        image: imageUrl,
        categoryId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setName('');
      setQuantity(1);
      setDescription('');
      setImageUrl('');
      setPreviewUrl(null);
      setCategoryId('');
      onClose();
    } catch (error) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setName('');
    setQuantity(1);
    setDescription('');
    setImageUrl('');
    setPreviewUrl(null);
    setCategoryId('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      clearForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between p-4 ">
          <h2 className="text-lg font-medium">เพิ่มสินค้าใหม่</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <input
              type="text"
              placeholder="ชื่อสินค้า *"
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">หมวดหมู่ *</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="จำนวน"
              className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <textarea
              placeholder="รายละเอียดสินค้า (ถ้ามี)"
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <div className="relative">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-64 object-contain rounded-md border"
                  />
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setImageUrl('');
                    }}
                    disabled={isSubmitting}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">เลือกรูปสินค้า</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4  bg-gray-50 rounded-lg">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !categoryId}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                บันทึก...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                บันทึก
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { db } from '../app/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { X, Pencil } from 'lucide-react';

export default function EditProductModal({ isOpen, onClose, product }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setQuantity(product.quantity || 0);
      setDescription(product.detail || '');
      setImageBase64(product.image || '');
      setPreviewUrl(product.image || '');
    }
  }, [product]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!product?.id || !name.trim()) return;

    const ref = doc(db, 'products', product.id);
    await updateDoc(ref, {
      name: name.trim(),
      quantity,
      detail: description,
      image: imageBase64,
      updatedAt: Timestamp.now(),
    });

    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg relative shadow-lg">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Pencil className="text-yellow-600" />
          แก้ไขสินค้า
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">ชื่อสินค้า</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">จำนวนสินค้า</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">รายละเอียด</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">รูปสินค้า</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {previewUrl && (
              <img src={previewUrl} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full"
          >
            บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}

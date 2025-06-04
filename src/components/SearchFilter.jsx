'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../app/lib/firebase';

export default function SearchFilter({ search, setSearch, category, setCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.name.localeCompare(b.name, 'th', { sensitivity: 'base' }));
      setCategories(data);
    });

    return () => unsubscribe(); // ✅ cleanup เพื่อลด memory leak และ reload
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="ค้นหาชื่อสินค้า"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 px-3 py-2 rounded w-full md:w-1/2 focus:ring-2 focus:ring-blue-400 outline-none transition"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border border-gray-300 px-3 py-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400 outline-none transition"
      >
        <option value="">ทั้งหมด</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>
  );
}

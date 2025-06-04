'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { History } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) =>
    timestamp?.toDate().toLocaleString('th-TH', {
      dateStyle: 'short',
      timeStyle: 'short',
    }) ?? '-';

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <History className="w-6 h-6 text-purple-700" />
        ประวัติการทำรายการ
      </h1>

      <div className="overflow-auto rounded shadow bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">สินค้า</th>
              <th className="px-4 py-2 text-left">ประเภท</th>
              <th className="px-4 py-2 text-left">จำนวน</th>
              <th className="px-4 py-2 text-left">วันที่และเวลา</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{log.productName}</td>
                <td className="px-4 py-2">
                  {log.action === 'add' ? 'เพิ่ม' : 'เบิก'}
                </td>
                <td className="px-4 py-2">{log.amount}</td>
                <td className="px-4 py-2">{formatDate(log.timestamp)}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center px-4 py-4 text-gray-500">
                  ยังไม่มีประวัติการทำรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

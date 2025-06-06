'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Clock, Plus, Minus, ArrowLeft, Filter, Search } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(data);
      setFilteredLogs(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = logs;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.action === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  }, [logs, filterType, searchTerm]);

  const formatDate = (timestamp) =>
    timestamp?.toDate().toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) ?? '-';

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = timestamp.toDate();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'เมื่อสักครู่';
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    return formatDate(timestamp);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">กลับ</span>
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">ประวัติการทำรายการ</h1>
                  <p className="text-sm text-slate-500">{filteredLogs.length} รายการ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">ทั้งหมด</option>
                <option value="add">เพิ่มสินค้า</option>
                <option value="remove">เบิกสินค้า</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {logs.length === 0 ? 'ยังไม่มีประวัติการทำรายการ' : 'ไม่พบรายการที่ค้นหา'}
              </h3>
              <p className="text-slate-500">
                {logs.length === 0 
                  ? 'เริ่มต้นจัดการสินค้าเพื่อดูประวัติที่นี่' 
                  : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="group hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      {/* Action Icon */}
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                        log.action === 'add' 
                          ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200' 
                          : 'bg-rose-100 text-rose-600 group-hover:bg-rose-200'
                      }`}>
                        {log.action === 'add' ? (
                          <Plus className="w-6 h-6" />
                        ) : (
                          <Minus className="w-6 h-6" />
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg mb-1">
                          {log.productName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.action === 'add' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.action === 'add' ? 'เพิ่มสินค้า' : 'เบิกสินค้า'}
                          </span>
                          <span className="text-slate-600">
                            จำนวน <span className="font-semibold">{log.amount}</span> ชิ้น
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {getRelativeTime(log.timestamp)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
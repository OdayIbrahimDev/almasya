'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import { motion } from 'framer-motion';
import { adminAPI } from '../../service/api';

const AdminOffersPage = () => {
  const [name, setName] = React.useState('خصم عام');
  const [percentage, setPercentage] = React.useState(10);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = async () => {
    try {
      const res = await adminAPI.listOffers();
      setOffers(res.data || []);
    } catch {}
  };

  React.useEffect(() => { load(); }, []);

  const create = async () => {
    setMsg(null);
    try {
      setLoading(true);
      await adminAPI.createOffer({ name: name.trim() || 'عرض', percentage, scope: 'all' });
      setMsg('تم إنشاء العرض وتطبيقه');
      setName('خصم عام');
      setPercentage(10);
      await load();
    } catch {
      setMsg('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: string) => {
    try {
      await adminAPI.toggleOffer(id);
      await load();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#251b43]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#251b43]">
        <h1 className="text-2xl font-bold text-white mb-6">العروض</h1>
        <div className="bg-[#251b43] rounded-2xl shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">اسم العرض</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#211c31] text-right bg-[#251b43] text-white"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">نسبة الخصم %</label>
              <input type="number" min={1} max={90} value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#211c31] text-right bg-[#251b43] text-white"/>
            </div>
            <div className="flex items-end justify-end">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading} onClick={create} className="px-6 py-2 bg-[#251b43] text-white rounded-lg disabled:opacity-70">إنشاء عرض عام</motion.button>
            </div>
          </div>
          {msg && <div className="text-right text-gray-300">{msg}</div>}
        </div>

        <div className="mt-8 bg-[#251b43] rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-white mb-4">العروض الحالية</h2>
          <div className="space-y-3">
            {offers.map((o) => (
              <div key={o._id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg">
                <div className="text-right">
                  <div className="font-medium text-white">{o.name}</div>
                  <div className="text-sm text-gray-300">خصم {o.percentage}% · {o.scope}</div>
                </div>
                <button onClick={() => toggle(o._id)} className={`px-3 py-1 rounded-lg text-white ${o.isActive ? 'bg-green-600' : 'bg-gray-400'}`}>{o.isActive ? 'نشط' : 'موقوف'}</button>
              </div>
            ))}
            {offers.length === 0 && <div className="text-center text-gray-400">لا توجد عروض</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOffersPage;



'use client';

import { useState } from 'react';
import Header from '@/app/components/layout/Header';
import { contactAPI } from '@/app/service/api';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatus('sending');
      
      const result = await contactAPI.submit(form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '', phone: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">تواصل معنا</h1>
          <p className="text-gray-300">للاستفسارات عن منتجاتنا أو الطلبات بالجملة والقطعة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-[#251b43] rounded-md shadow p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">الاسم</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">رقم الجوال (اختياري)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white"
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">رسالتك</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={6}
                className="w-full border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-gray-300 text-[#211c31] px-6 py-3 rounded-md font-semibold hover:bg-gray-400 transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? 'جاري الإرسال...' : 'إرسال'}
            </button>
            {status === 'sent' && (
              <p className="text-green-400 text-sm">تم إرسال رسالتك بنجاح. سنعاود التواصل قريباً.</p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm">حدث خطأ أثناء الإرسال. حاول مرة أخرى.</p>
            )}
          </form>

          <div className="bg-[#251b43] rounded-md shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">معلومات التواصل</h2>
            <p className="text-gray-300">يسرّنا تواصلك معنا عبر الوسائل التالية:</p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="font-semibold">واتساب:</span>
                <a href="https://wa.me/message/GAYCPDLPDHLSH1" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                  تواصل معنا مباشرة
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">انستغرام:</span>
                <a href="https://www.instagram.com/almasya_jewelry?igsh=MWl2MDYzeWJsd2t6dQ==" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">
                  @almasya_jewelry
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">فيسبوك:</span>
                <a href="https://www.facebook.com/share/1BjfTqEJjH/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  Almasya Jewelry
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">تيك توك:</span>
                <a href="https://www.tiktok.com/@almasya_jewelry?_t=ZS-8x93h7CeNW5&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  @almasya_jewelry
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">الموقع:</span>
                <span>الإمارات (نشحن لكل الدول)</span>
              </li>
            </ul>
            <div className="bg-gradient-to-br from-[#211c31]/20 to-gray-300/20 rounded-md p-4 text-center">
              <p className="text-gray-300 font-medium">نشتغل بالجملة وبالقطعة للمحلات وللأفراد</p>
              <p className="text-sm text-gray-400 mt-1">منتجاتنا وصلت لأكثر من 5 دول</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;



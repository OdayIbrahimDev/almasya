'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import { useCart } from '../context/Cart';
import { useAuth } from '../context/Auth';
import { useRouter } from 'next/navigation';
import { ordersAPI, productsAPI } from '../service/api';

const CheckoutPage = () => {
  const router = useRouter();
  const { 
    items, 
    clearCart, 
    getTotalPrice, 
    appliedCoupon, 
    couponDiscount, 
    getFinalTotal 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [notes, setNotes] = useState('');
  const [activeCurrencyId, setActiveCurrencyId] = useState<string>('');
  const [autoRedirectTimer, setAutoRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!items || items.length === 0) {
      router.replace('/cart');
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [items, router, isAuthenticated]);

  // Load active currency once for orders
  useEffect(() => {
    (async () => {
      try {
        const res = await productsAPI.getActiveCurrency();
        if (res.data?._id) setActiveCurrencyId(res.data._id);
      } catch {}
    })();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoRedirectTimer) {
        clearTimeout(autoRedirectTimer);
      }
    };
  }, [autoRedirectTimer]);

  const formatPrice = (price: number, symbol: string) => `${price.toLocaleString('ar-EG')} ${symbol}`;

  const validateForm = () => {
    // Check authentication before proceeding
    if (!isAuthenticated) {
      setErrorMessage('يرجى تسجيل الدخول لإتمام عملية الشراء');
      setShowErrorModal(true);
      router.push('/login');
      return false;
    }
    
    if (!phone || phone.trim().length < 6) {
      setErrorMessage('يرجى إدخال رقم جوال صالح');
      setShowErrorModal(true);
      return false;
    }
    if (!street || !stateVal) {
      setErrorMessage('يرجى إكمال العنوان (الشارع والمنطقة)');
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (submitting) return;
    
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmOrder = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);

      const currencyId = activeCurrencyId || (items as any)[0]?.currencyId || '';
      const payload = {
        items: (items as any).map((it: any) => ({ productId: it._id, quantity: it.quantity })),
        currencyId,
        phone: phone.trim(),
        shippingAddress: { street: street.trim(), state: stateVal.trim() },
        notes,
        // Include coupon information
        appliedCoupon: appliedCoupon && couponDiscount > 0 ? {
          couponId: appliedCoupon._id,
          code: appliedCoupon.code,
          discount: Number(couponDiscount) || 0,
          type: appliedCoupon.type || 'fixed'
        } : undefined,
        finalTotal: Number(getFinalTotal()) || 0
      } as any;

      // Debug logging
      console.log('Sending order payload:', payload);

      await ordersAPI.create(payload);
      clearCart(); // This will also clear the coupon since it's handled in the context
      setShowSuccessModal(true);
      
      // Set auto-redirect after 5 seconds
      const timer = setTimeout(() => {
        router.push('/orders');
      }, 5000);
      setAutoRedirectTimer(timer);
    } catch (e: any) {
      console.error('Create order error:', e);
      const msg = e?.response?.data?.message || 'فشل إنشاء الطلب. تأكد من تسجيل الدخول وإكمال البيانات المطلوبة.';
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#251b43]">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a075ad] mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحقق من تسجيل الدخول...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#251b43]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#251b43]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#251b43] rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6 text-right">إتمام الشراء</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-4 order-2 md:order-1">
              <div>
                <label className="block text-sm text-gray-300 mb-1">رقم الجوال</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="w-full border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">الشارع</label>
                <input value={street} onChange={(e) => setStreet(e.target.value)} className="w-full border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">المنطقة</label>
                <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="w-full border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">ملاحظات</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#211c31] bg-[#251b43] text-white" rows={3} />
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => router.push('/cart')} className="flex-1 border border-gray-600 text-gray-300 py-3 rounded-xl font-medium hover:bg-[#251b43]">العودة للسلة</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-[gray-300] text-[#211c31] py-3 rounded-xl font-medium hover:bg-[#c0a47e] disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="order-1 md:order-2">
              <div className="bg-[#251b43] rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 text-right">ملخص الطلب</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">عدد المنتجات:</span>
                    <span className="font-medium text-white">{items.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">إجمالي الكمية:</span>
                    <span className="font-medium text-white">{(items as any).reduce((total: number, it: any) => total + it.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">الشحن:</span>
                    <span className="text-green-600 font-medium">مجاني</span>
                  </div>
                  
                  {/* Coupon Discount */}
                  {appliedCoupon && couponDiscount > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">خصم الكوبون ({appliedCoupon.code}):</span>
                        <span className="text-green-600 font-medium">-{formatPrice(couponDiscount, (items as any)[0]?.currency?.symbol || 'د.أ')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">المجموع الفرعي:</span>
                        <span className="font-medium text-white">{formatPrice(getTotalPrice(), (items as any)[0]?.currency?.symbol || 'د.أ')}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">الإجمالي النهائي:</span>
                      <span className="text-2xl font-bold text-[gray-300]">{formatPrice(getFinalTotal(), (items as any)[0]?.currency?.symbol || 'د.أ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Success Modal with Confetti */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }, (_, i) => {
              const colors = ['#a075ad', '#8b6a9a', '#7a5a8a', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
              const positions = [
                { left: 10, top: 20, x: 100 },
                { left: 20, top: 30, x: 200 },
                { left: 30, top: 40, x: 300 },
                { left: 40, top: 50, x: 400 },
                { left: 50, top: 60, x: 500 },
                { left: 60, top: 70, x: 600 },
                { left: 70, top: 80, x: 700 },
                { left: 80, top: 90, x: 800 },
                { left: 90, top: 10, x: 900 },
                { left: 15, top: 25, x: 150 },
                { left: 25, top: 35, x: 250 },
                { left: 35, top: 45, x: 350 },
                { left: 45, top: 55, x: 450 },
                { left: 55, top: 65, x: 550 },
                { left: 65, top: 75, x: 650 },
                { left: 75, top: 85, x: 750 },
                { left: 85, top: 95, x: 850 },
                { left: 95, top: 15, x: 950 },
                { left: 12, top: 22, x: 120 },
                { left: 22, top: 32, x: 220 },
                { left: 32, top: 42, x: 320 },
                { left: 42, top: 52, x: 420 },
                { left: 52, top: 62, x: 520 },
                { left: 62, top: 72, x: 620 },
                { left: 72, top: 82, x: 720 },
                { left: 82, top: 92, x: 820 },
                { left: 92, top: 12, x: 920 },
                { left: 18, top: 28, x: 180 },
                { left: 28, top: 38, x: 280 },
                { left: 38, top: 48, x: 380 },
                { left: 48, top: 58, x: 480 },
                { left: 58, top: 68, x: 580 },
                { left: 68, top: 78, x: 680 },
                { left: 78, top: 88, x: 780 },
                { left: 88, top: 98, x: 880 },
                { left: 98, top: 18, x: 980 },
                { left: 14, top: 24, x: 140 },
                { left: 24, top: 34, x: 240 },
                { left: 34, top: 44, x: 340 },
                { left: 44, top: 54, x: 440 },
                { left: 54, top: 64, x: 540 },
                { left: 64, top: 74, x: 640 },
                { left: 74, top: 84, x: 740 },
                { left: 84, top: 94, x: 840 },
                { left: 94, top: 14, x: 940 },
                { left: 16, top: 26, x: 160 },
                { left: 26, top: 36, x: 260 },
                { left: 36, top: 46, x: 360 },
                { left: 46, top: 56, x: 460 },
                { left: 56, top: 66, x: 560 }
              ];
              const pos = positions[i % positions.length];
              return (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: colors[i % colors.length],
                    left: `${pos.left}%`,
                    top: `${pos.top}%`,
                  }}
                  initial={{ 
                    y: -100, 
                    x: pos.x,
                    rotate: 0,
                    scale: 1
                  }}
                  animate={{ 
                    y: 1000,
                    x: pos.x + (i % 2 === 0 ? 100 : -100),
                    rotate: 360,
                    scale: 0
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative z-10"
          >
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <motion.svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>
            
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              طلبك تم بنجاح! 🎉
            </motion.h2>
            <motion.p 
              className="text-gray-600 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              شكراً لك على طلبك. تم إرسال طلبك بنجاح وسيتم التواصل معك قريباً لتأكيد التفاصيل.
            </motion.p>
            <motion.p 
              className="text-sm text-gray-500 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              سيتم تحويلك تلقائياً إلى صفحة الطلبات خلال 5 ثوانٍ...
            </motion.p>
            
            <motion.div 
              className="flex gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => {
                  // Clear auto-redirect timer
                  if (autoRedirectTimer) {
                    clearTimeout(autoRedirectTimer);
                    setAutoRedirectTimer(null);
                  }
                  setShowSuccessModal(false);
                  // Add small delay to ensure modal closes properly
                  setTimeout(() => {
                    router.push('/orders');
                  }, 100);
                }}
                className="flex-1 bg-gradient-to-r from-[#a075ad] to-[#8b6a9a] text-white py-3 rounded-xl font-medium hover:from-[#8b6a9a] hover:to-[#7a5a8a] transition-all duration-200"
              >
                عرض طلباتي
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">حدث خطأ</h2>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-gradient-to-r from-[#a075ad] to-[#8b6a9a] text-white py-3 rounded-xl font-medium hover:from-[#8b6a9a] hover:to-[#7a5a8a] transition-all duration-200"
            >
              موافق
            </button>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-[#a075ad] to-[#8b6a9a] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">تأكيد الطلب</h2>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من إتمام هذا الطلب؟ سيتم إرسال طلبك وسيتم التواصل معك قريباً.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={confirmOrder}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-[#a075ad] to-[#8b6a9a] text-white py-3 rounded-xl font-medium hover:from-[#8b6a9a] hover:to-[#7a5a8a] transition-all duration-200 disabled:opacity-50"
              >
                {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;



'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/Cart';
import { FILE_BASE_URL } from '../service/api';
import { useAuth } from '../context/Auth';
import Header from '../components/layout/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CouponInput from '../components/ui/CouponInput';

const CartPage = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice,
    appliedCoupon,
    couponDiscount,
    setCouponDiscount,
    removeCoupon,
    getFinalTotal
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  // Check authentication when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const formatPrice = (price: number, symbol: string) => {
    return `${price.toLocaleString('ar-SA')} ${symbol}`;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsCheckingOut(true);
    router.push('/checkout');
  };

  const handleCouponApplied = (coupon: any, discount: number) => {
    setCouponDiscount(coupon, discount);
  };

  const handleCouponRemoved = () => {
    removeCoupon();
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto"></div>
            <p className="mt-4 text-gray-300">جاري التحقق من تسجيل الدخول...</p>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#251b43]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-8xl mb-8">
              <ShoppingBag/>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">سلة التسوق فارغة</h1>
            <p className="text-xl text-gray-300 mb-10 max-w-md mx-auto">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-300 text-[#211c31] px-10 py-4 rounded-2xl font-medium hover:bg-gray-400 transition-all duration-200 shadow-lg"
              >
                تصفح المنتجات
              </motion.button>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#251b43]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#251b43]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white">سلة التسوق</h1>
            <button
              onClick={clearCart}
              className="text-gray-300 hover:text-red-400 font-medium flex items-center space-x-2 space-x-reverse transition-colors"
            >
              <Trash2 size={20} />
              <span> تفريغ السلة </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-[#251b43]/60 backdrop-blur supports-[backdrop-filter]:bg-[#251b43]/60 rounded-2xl shadow-lg border border-[gray-300]/40 overflow-hidden">
              {items.map((item, index) => (
                <motion.div 
                  key={(item as any)._id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 ${index !== items.length - 1 ? 'border-b border-[gray-300]/50' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[gray-300] flex-shrink-0 shadow-md">
                      <Link href={`/products/${(item as any)._id}`}>
                        <img src={(item as any).image ? `${FILE_BASE_URL}${(item as any).image.replace(/^\/uploads\//, '')}` : '/placeholder-product.jpg'} alt={(item as any).name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <Link href={`/products/${(item as any)._id}`} className="font-semibold text-white text-lg hover:text-[gray-300] transition-colors">
                          {(item as any).name}
                        </Link>
                        <button onClick={() => removeFromCart((item as any)._id)} className="text-gray-400 hover:text-red-400 p-2 rounded-full hover:bg-red-500/20 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold text-lg">
                          {(item as any).offerPrice ? (
                            <>
                              <span className="text-[gray-300]">{formatPrice((item as any).offerPrice, (item as any).currency?.symbol || 'د.أ')}</span>
                              <span className="text-sm text-gray-400 line-through mr-3">
                                {formatPrice((item as any).price, (item as any).currency?.symbol || 'د.أ')}
                              </span>
                            </>
                          ) : (
                            <span>{formatPrice((item as any).price, (item as any).currency?.symbol || 'د.أ')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity((item as any)._id, (item as any).quantity - 1)} className="w-10 h-10 text-gray-400 rounded-full border-2 border-[gray-300] flex items-center justify-center hover:bg-[gray-300]/80 transition-all">
                            <Minus size={16} />
                          </button>
                          <span className="px-6 h-10 text-gray-400 rounded-full border-2 border-[gray-300] font-semibold flex items-center justify-center min-w-[60px]">{(item as any).quantity}</span>
                          <button onClick={() => updateQuantity((item as any)._id, (item as any).quantity + 1)} className="w-10 h-10 text-gray-400 rounded-full border-2 border-[gray-300] flex items-center justify-center hover:bg-[gray-300]/80 transition-all">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#251b43]/60 backdrop-blur supports-[backdrop-filter]:bg-[#251b43]/60 rounded-2xl p-8 shadow-lg border border-[gray-300]/40 sticky top-6">
              <h2 className="text-2xl font-bold text-white mb-6">ملخص الطلب</h2>
              <CouponInput
                onCouponApplied={handleCouponApplied}
                onCouponRemoved={handleCouponRemoved}
                orderAmount={getTotalPrice()}
                productIds={items.map((item: any) => (item as any)._id)}
                className="mb-6"
              />
              <div className="space-y-4 text-base">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">المجموع الفرعي</span>
                  <span className="font-semibold text-white">{formatPrice(getTotalPrice(), (items[0] as any)?.currency?.symbol || 'د.أ')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">خصم الكوبون</span>
                    <span className="font-semibold text-green-400">-{couponDiscount.toLocaleString('ar-SA')} د.أ</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">رسوم الشحن</span>
                  <span className="font-semibold text-[gray-300]">مجاني</span>
                </div>
                <div className="border-t border-[gray-300] pt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-white">الإجمالي</span>
                  <span className="text-2xl font-bold text-[gray-300]">{formatPrice(getFinalTotal(), (items[0] as any)?.currency?.symbol || 'د.أ')}</span>
                </div>
              </div>
              <button onClick={handleCheckout} disabled={isCheckingOut} className="mt-8 w-full bg-gray-300 text-[#211c31] py-4 rounded-2xl font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 shadow-lg">
                {isCheckingOut ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-6 h-6 border-2 border-[#211c31] border-t-transparent rounded-full" />
                    <span>جاري المتابعة...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={24} />
                    <span>إتمام الشراء</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
              <div className="mt-6 text-sm text-gray-400 text-center">ضمان لمدة 90 يوماً ضد عيوب التصنيع</div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;

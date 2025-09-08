'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/Cart';
import { useAuth } from '../context/Auth';
import Header from '../components/layout/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { colorClasses } from '../utils/colors';
import { wishlistAPI, FILE_BASE_URL } from '../service/api';
import type { AxiosError } from 'axios';

interface WishlistItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  currency: string;
  images: string[];
  category: string;
}

const WishlistPage = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);

  // Check authentication when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchWishlist = async () => {
      setRequiresAuth(false);
      try {
        const res = await wishlistAPI.getMy();
        type ApiItem = { product?: { _id?: string; name?: string; description?: string; price: number; offerPrice?: number; image?: string; category?: { name?: string } } | string };
        const data = res.data as ApiItem[];
        const items: WishlistItem[] = Array.isArray(data)
          ? data.map((it) => {
              const p = typeof it.product === 'object' ? it.product : undefined;
              return {
                _id: p?._id || String(it.product || ''),
                name: p?.name || '',
                description: p?.description || '',
                price: p?.price || 0,
                offerPrice: p?.offerPrice,
                currency: 'د.أ',
                images: p?.image ? [`${FILE_BASE_URL}${p.image.replace(/^\/uploads\//, '')}`] : [],
                category: p?.category?.name || 'بدون فئة',
              } as WishlistItem;
            })
          : [];
        setWishlistItems(items.filter(i => i._id));
      } catch (e) {
        const err = e as AxiosError;
        if (err?.response?.status === 401) {
          setRequiresAuth(true);
        }
        // fallback to local storage for guests
        try {
          const saved = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
          if (Array.isArray(saved)) setWishlistItems(saved);
        } catch {}
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();

    const onFocus = () => fetchWishlist();
    const onVisible = () => document.visibilityState === 'visible' && fetchWishlist();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const saveWishlist = (items: WishlistItem[]) => {
    localStorage.setItem('wishlistItems', JSON.stringify(items));
    setWishlistItems(items);
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlistItems(prev => prev.filter(i => i._id !== productId));
    } catch (error) {
      // fallback local remove
      const updated = wishlistItems.filter(item => item._id !== productId);
      saveWishlist(updated);
    }
  };

  const handleAddToCart = (product: WishlistItem) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.offerPrice || product.price,
      image: product.images?.[0] || '',
      currency: { symbol: 'د.أ', code: 'UAE' }
    }, 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a075ad] mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المفضلة...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a075ad] mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحقق من تسجيل الدخول...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">المفضلة</h1>
              <p className="text-gray-600">المنتجات التي أحببتها</p>
            </div>
            <Link href="/" className="inline-flex items-center text-[#a075ad] hover:text-[#8b6a9a]">
              <ArrowLeft size={20} className="ml-2" />
              العودة للرئيسية
            </Link>
          </div>
        </motion.div>

        {/* Wishlist Content */}
        {requiresAuth && (
          <div className="mb-6 p-4 rounded-xl bg-[gray-300]/10 text-[gray-300] text-right">
            لتخزين المفضلة في حسابك، يرجى تسجيل الدخول.
          </div>
        )}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-[#a075ad]/20 to-[#674b71]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-[#a075ad]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">قائمة المفضلة فارغة</h2>
            <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
            <Link
              href="/products"
              className="inline-flex items-center bg-[#a075ad] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#8b6a9a] transition-all duration-200"
            >
              <Package size={20} className="ml-2" />
              تصفح المنتجات
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Product Image */}
                <div className="h-48 bg-gradient-to-br from-[#a075ad]/10 to-[#674b71]/10 flex items-center justify-center relative">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const sibling = target.nextElementSibling as HTMLElement;
                        if (sibling) {
                          sibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 bg-gradient-to-br from-[#a075ad]/10 to-[#674b71]/10 flex items-center justify-center ${item.images && item.images.length > 0 ? 'hidden' : 'flex'}`}>
                    <Package size={48} className="text-[#a075ad]" />
                  </div>
                  
                  {/* Remove from wishlist button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
                
                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#a075ad]">
                        {item.offerPrice || item.price} {item.currency}
                      </p>
                      {item.offerPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {item.price} {item.currency}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-[#a075ad]/20 text-[#674b71] rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-[#a075ad] text-white py-2 px-4 rounded-lg hover:bg-[#8b6a9a] transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart size={16} />
                      <span>أضف للسلة</span>
                    </motion.button>
                    
                    <Link href={`/products/${item._id}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200"
                      >
                        عرض التفاصيل
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ShoppingCart, ArrowRight, ArrowLeft, Package, Truck, Shield, Clock } from 'lucide-react';
import Header from '../../components/layout/Header';
import { productsAPI, FILE_BASE_URL, reviewsAPI } from '../../service/api';
import { useAuth } from '../../context/Auth';
import { useCart } from '../../context/Cart';
import { colorClasses } from '../../utils/colors';

interface Product {
  _id: string;
  name?: string;
  description?: string;
  price: number;
  offerPrice?: number;
  image?: string;
  category?: {
    _id: string;
    name?: string;
  } | null;
  currency?: {
    symbol?: string;
    code?: string;
  } | null;
  averageRating?: number;
  totalReviews?: number;
  inStock?: boolean;
}

const ProductDetailPage = () => {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [myRating, setMyRating] = useState<number>(5);
  const [myComment, setMyComment] = useState<string>('');
  const [savingReview, setSavingReview] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    // Sync wishlist state when product loads
    if (!product) return;
    try {
      const saved = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      if (Array.isArray(saved)) {
        setIsWishlisted(saved.some((it: any) => it._id === product._id));
      }
    } catch {}
  }, [product]);

  const fetchProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getById(productId);
      setProduct(response.data);
      // Load reviews in parallel
      const rev = await reviewsAPI.listByProduct(productId);
      setReviews(Array.isArray(rev.data) ? rev.data : []);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('حدث خطأ في جلب المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, symbol?: string) => {
    return `${(price || 0).toLocaleString('ar-SA')} ${symbol || 'د.أ'}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // The cart context will handle redirecting to login
      return;
    }
    
    if (product) {
      addToCart(product as any, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const raw = localStorage.getItem('wishlistItems');
      let items: any[] = raw ? JSON.parse(raw) : [];
      const idx = items.findIndex((it) => it._id === product._id);
      if (idx >= 0) {
        items.splice(idx, 1);
        setIsWishlisted(false);
      } else {
        items.push({
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          offerPrice: product.offerPrice,
          currency: product.currency?.symbol || 'د.أ',
          image: product.image || '',
          category: product.category?.name || 'بدون فئة'
        });
        setIsWishlisted(true);
      }
      localStorage.setItem('wishlistItems', JSON.stringify(items));
    } catch (e) {
      console.error('Wishlist error:', e);
    }
  };

  const images = product?.image ? [`${FILE_BASE_URL}${product.image.replace(/^\/uploads\//, '')}`] : ['/placeholder-product.jpg'];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const submitReview = async () => {
    if (!product) return;
    try {
      setSavingReview(true);
      const res = await reviewsAPI.upsertMyReview(product._id, { rating: myRating, comment: myComment.trim() });
      // Update aggregates and list
      const updatedList = await reviewsAPI.listByProduct(product._id);
      setReviews(updatedList.data || []);
      // Update product aggregates locally if returned
      if (res.data?.averageRating !== undefined) {
        setProduct({ ...(product as any), averageRating: res.data.averageRating, totalReviews: res.data.totalReviews });
      }
      setMyComment('');
    } catch (e) {
      console.error('Save review error:', e);
    } finally {
      setSavingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#251b43]">
        <Header />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {error || 'المنتج غير موجود'}
          </h2>
          <p className="text-gray-300">يرجى المحاولة مرة أخرى</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#251b43]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 mx-4 sm:px-6 lg:px-8 py-8 bg-[#251b43]">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <nav className="flex items-center space-x-2 space-x-reverse text-sm text-gray-300">
            <span>الرئيسية</span>
            <ArrowLeft size={16} />
            <span>{product.category?.name || 'بدون فئة'}</span>
            <ArrowLeft size={16} />
            <span className="text-white font-medium">{product.name || 'منتج'}</span>
          </nav>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative bg-[#251b43] rounded-2xl shadow-lg overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name || 'منتج'}
                className="w-full h-96 object-cover"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-[#251b43]/80 rounded-full flex items-center justify-center hover:bg-[#251b43] transition-colors"
                  >
                    <ArrowLeft size={20} className="text-gray-300" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-[#251b43]/80 rounded-full flex items-center justify-center hover:bg-[#251b43] transition-colors"
                  >
                    <ArrowRight size={20} className="text-gray-300" />
                  </button>
                </>
              )}

              {/* Offer Badge */}
              {product.offerPrice && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  عرض خاص
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-3 space-x-reverse">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImage
                        ? 'border-gray-300'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name || 'منتج'} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6"
          >
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium bg-gray-300/10 px-3 py-1 rounded-full">
                {product.category?.name || 'بدون فئة'}
              </span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Star size={20} className="text-gray-300 fill-current" />
                <span className="font-medium text-white">
                  {(product.averageRating || 0).toFixed(1)}
                </span>
                <span className="text-gray-400">
                  ({product.totalReviews || 0} تقييم)
                </span>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-white text-right">
              {product.name || 'منتج'}
            </h1>

            {/* Price */}
            <div className="space-y-2">
              {product.offerPrice ? (
                <>
                  <div className="text-3xl font-bold text-red-600">
                    {formatPrice(product.offerPrice, product.currency?.symbol)}
                  </div>
                  <div className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price, product.currency?.symbol)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    توفير {formatPrice((product.price || 0) - (product.offerPrice || 0), product.currency?.symbol)}
                  </div>
                </>
              ) : (
                <div className="text-3xl font-bold text-white">
                  {formatPrice(product.price, product.currency?.symbol)}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 text-right">الوصف</h3>
              <p className="text-gray-300 text-right leading-relaxed">
                {product.description || 'لا يوجد وصف لهذا المنتج'}
              </p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 space-x-reverse">
                <label className="text-gray-300 font-medium">الكمية:</label>
                <div className="flex items-center border border-gray-600 rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-300/10 transition-colors text-gray-300"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-600 min-w-[60px] text-center text-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-300/10 transition-colors text-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inStock === false}
                  className="flex-1 bg-gray-300 text-[#211c31] ml-2 py-3 rounded-sm font-medium hover:bg-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
                >
                  {addedToCart ? (
                    <>
                      <span className="text-green-600">✓ تم الإضافة للسلة</span>
                    </>
                  ) : !isAuthenticated ? (
                    <>
                      <span>تسجيل الدخول لإضافة للسلة</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      <span>{product.inStock === false ? 'غير متوفر' : 'أضف للسلة'}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={toggleWishlist}
                  aria-label="wishlist-toggle"
                  className={`w-12 h-12 border-2 rounded-sm flex items-center justify-center transition-colors ${
                    isWishlisted ? 'border-gray-300 text-gray-300' : 'border-gray-600 hover:border-gray-300 hover:text-gray-300'
                  }`}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-600">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Package className="w-6 h-6 text-gray-300" />
                <span className="text-sm text-gray-300">شحن مجاني</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Truck className="w-6 h-6 text-gray-300" />
                <span className="text-sm text-gray-300">توصيل سريع</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Shield className="w-6 h-6 text-gray-300" />
                <span className="text-sm text-gray-300">ضمان الجودة</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Clock className="w-6 h-6 text-gray-300" />
                <span className="text-sm text-gray-300">دعم 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-10">
          <div className="bg-[#251b43] rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 text-right">التقييمات</h3>

            {/* Add/Update My Review */}
            <div className="mb-6 border-b border-gray-600 pb-6">
              {isAuthenticated ? (
                <div className="space-y-3 text-right">
                  <label className="block text-sm font-medium text-gray-300">تقييمك:</label>
                  <div className="flex items-center justify-end gap-2">
                    {[1,2,3,4,5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMyRating(n)}
                        className={`p-1 ${n <= myRating ? 'text-gray-300' : 'text-gray-500'}`}
                        aria-label={`rating-${n}`}
                      >
                        <Star className={`${n <= myRating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="اكتب تعليقك هنا..."
                    className="w-full border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400 placeholder:opacity-100 bg-[#251b43] text-white"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={submitReview}
                      disabled={savingReview || !myComment.trim()}
                      className="px-5 py-2 rounded-lg text-[#211c31] bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                    >
                      {savingReview ? 'جاري الحفظ...' : 'حفظ التقييم'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-right text-gray-300">سجّل دخولك لإضافة تقييم.</div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center text-gray-400">لا توجد تقييمات بعد</div>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="p-4 bg-[#251b43] rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-right">
                        <div className="font-medium text-white">{r.user?.name || 'مستخدم'}</div>
                        <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</div>
                      </div>
                      <div className="flex items-center">
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={`w-4 h-4 ${n <= (r.rating || 0) ? 'text-gray-300 fill-current' : 'text-gray-500'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-gray-300">
                      {r.comment}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetailPage;

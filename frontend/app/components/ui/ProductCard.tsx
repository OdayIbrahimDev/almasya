'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { wishlistAPI } from '../../service/api';
import { useCart } from '../../context/Cart';
import type { ProductForCartInput } from '../../context/Cart';
import { useEffect, useState } from 'react';

export interface ProductCardProps {
  product: {
    _id: string;
    name?: string;
    description?: string;
    price: number;
    offerPrice?: number;
    image?: string;
    category?: { _id: string; name?: string } | null;
    averageRating?: number;
    totalReviews?: number;
  };
  currencySymbol: string;
}

const ProductCard = ({ product, currencySymbol }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const isWishlisted = wishlist.includes(product._id);
  const [addedPulse, setAddedPulse] = useState(false);
  const [wishRipple, setWishRipple] = useState(false);

  type WishlistApiItem = { product?: { _id?: string } | string };
  type SavedWishlistItem = { _id: string } & Record<string, unknown>;

  useEffect(() => {
    (async () => {
      try {
        const res = await wishlistAPI.getMy();
        const data = res.data as WishlistApiItem[];
        const ids: string[] = Array.isArray(data)
          ? data
              .map((it) => (typeof it.product === 'object' ? (it.product?._id || '') : String(it.product || '')))
              .filter(Boolean)
          : [];
        setWishlist(ids);
      } catch {
        // fallback to local storage if not authed
        try {
          const saved = JSON.parse(localStorage.getItem('wishlistItems') || '[]') as SavedWishlistItem[];
          if (Array.isArray(saved)) setWishlist(saved.map((p) => p._id));
        } catch {}
      }
    })();
  }, []);

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(product._id);
        setWishlist(prev => prev.filter(id => id !== product._id));
      } else {
        await wishlistAPI.add(product._id);
        setWishlist(prev => [...prev, product._id]);
      }
    } catch {
      // fallback local storage if unauthenticated
      try {
        const raw = localStorage.getItem('wishlistItems');
        const items: SavedWishlistItem[] = raw ? JSON.parse(raw) : [];
        const idx = items.findIndex((it) => it._id === product._id);
        if (idx >= 0) {
          items.splice(idx, 1);
        } else {
          items.push({
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            offerPrice: product.offerPrice,
            currency: currencySymbol,
            image: product.image,
            category: product.category?.name || 'بدون فئة',
          } as SavedWishlistItem);
        }
        localStorage.setItem('wishlistItems', JSON.stringify(items));
        setWishlist(items.map((p) => p._id));
      } catch {}
    } finally {
      setWishRipple(true);
      setTimeout(() => setWishRipple(false), 500);
    }
  };

  const renderPrice = (value: number, strike?: boolean) => (
    <span className={strike ? 'text-sm text-gray-400 line-through mr-2' : 'text-gray-300 font-bold'}>
      {(value || 0).toLocaleString('ar-SA')}
      <span className="ml-1 text-gray-300">{currencySymbol}</span>
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-black border border-gray-300/40 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Product Image Container */}
      <div className="relative" style={{ aspectRatio: '1 / 1' }}>
        <Link href={`/products/${product._id}`}>
          <img
            src={product.image ? `${process.env.NEXT_PUBLIC_FILE_BASE_URL || 'https://almasya.com/uploads/'}${product.image.replace(/^\/uploads\//, '')}` : '/placeholder-product.jpg'}
            alt={product.name || 'منتج'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>


    

        {/* Wishlist Button - Top Left */}
        <motion.button
          onClick={toggleWishlist}
          aria-label="wishlist-toggle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-3 left-4 p-2 rounded-full transition-all duration-200 ${
            isWishlisted 
              ? 'bg-white text-gray-300 border border-gray-300' 
              : 'bg-gray-300/50 text-gray-300 hover:bg-gray-300 hover:text-gray-300 border border-gray-300'
          }`}
        >
          <motion.span animate={wishRipple ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
          </motion.span>
          <AnimatePresence>
            {wishRipple && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.3, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 rounded-full border-2 border-gray-300"
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Offer Badge */}
        {product.offerPrice && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              خصم
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 border-t border-gray-300/20">
        {/* Product Name and Price */}
        <div className="flex items-center justify-between mb-3">
          <Link href={`/products/${product._id}`}>
            <h3 className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors">
              {product.name || 'منتج'}
            </h3>
          </Link>
          
          <div className="text-right">
            {product.offerPrice ? (
              <div className="space-y-1">
                <div className="text-xl font-bold text-gray-300">
                  {renderPrice(product.offerPrice)}
                </div>
                <div className="text-sm text-gray-400 line-through">
                  {renderPrice(product.price, true)}
                </div>
              </div>
            ) : (
              <div className="text-xl font-bold text-gray-300">
                {renderPrice(product.price)}
              </div>
            )}
          </div>
        </div>

        {/* Category and Rating */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <span className="bg-gray-300/20 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
              {product.category?.name || 'منتجات'}
            </span>
            <div className="flex items-center space-x-1 space-x-reverse">
              <Star size={14} className="text-gray-300 fill-current" />
              <span className="text-sm text-gray-400">
                {(product.averageRating || 0).toFixed(1)} ({product.totalReviews || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Add to Cart Button - Full Width */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const productForCart: ProductForCartInput = {
              _id: product._id,
              name: product.name,
              price: product.price,
              offerPrice: product.offerPrice,
              image: product.image,
              currency: { symbol: currencySymbol, code: 'AED' },
            };
            addToCart(productForCart, 1);
            setAddedPulse(true);
            setTimeout(() => setAddedPulse(false), 900);
          }}
          className="relative w-full bg-gray-300 hover:bg-gray-400 text-black rounded-full py-3 px-4 transition-colors flex items-center justify-center gap-2 font-medium group"
        >
          <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
          <span>أضف إلى السلة</span>
          <AnimatePresence>
            {addedPulse && (
              <motion.span
                key="added-check"
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: -6 }}
                exit={{ opacity: 0, scale: 0.6, y: -14 }}
                transition={{ duration: 0.45 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full text-white text-xs flex items-center justify-center shadow-lg"
              >
                ✓
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;





'use client';

import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { productsAPI } from '../service/api';
import ProductCard from '../components/ui/ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  image?: string;
  category?: { _id: string; name?: string } | null;
  averageRating?: number;
  totalReviews?: number;
}

const BestSellersPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [symbol, setSymbol] = useState('د.أ');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await productsAPI.getAll({ best: true, limit: 24, page: 1 });
        setProducts(res.data?.data || res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-right">الأكثر مبيعاً</h1>
        <p className="text-gray-300 mb-6 text-right">منتجات مختارة من فريقنا ومحبوبة من العملاء</p>

        {loading ? (
          <div className="text-center py-16 text-gray-400">جاري التحميل...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">لا توجد منتجات مميزة حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#251b43] p-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p as any} currencySymbol={symbol} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BestSellersPage;



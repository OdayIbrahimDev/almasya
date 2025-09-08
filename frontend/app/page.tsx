'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './components/layout/Header';
import { productsAPI, FILE_BASE_URL } from './service/api';
import Link from 'next/link';
import ProductCard from './components/ui/ProductCard';
import { Sparkles, Heart, Zap, Gem, Truck, Shield, Crown, HelpCircle, Sparkle, MessageCircle, Star } from 'lucide-react';


interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  image?: string;
  category: {
    _id: string;
    name: string;
  };
  currency: {
    symbol: string;
    code: string;
  };
  averageRating: number;
  totalReviews: number;
}

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}


interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCurrencySymbol, setActiveCurrencySymbol] = useState('د.إ');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  
  // Categories state (simplified)
  
  // Default categories if none are loaded
  const defaultCategories = [
    {
      _id: 'default-1',
      name: 'خواتم فاخرة',
      description: 'مجموعة حصرية من الخواتم الإماراتية المصنوعة يدوياً',
      image: '/placeholder-product.jpg'
    },
    {
      _id: 'default-2', 
      name: 'سلاسل أنيقة',
      description: 'سلاسل ذهبية وفضية بتصاميم إماراتية مميزة',
      image: '/placeholder-product.jpg'
    },
    {
      _id: 'default-3',
      name: 'إكسسوارات يدوية',
      description: 'إكسسوارات فريدة مصنوعة يدوياً بأعلى مستويات الجودة',
      image: '/placeholder-product.jpg'
    }
  ];
  
  // Use default categories if none are loaded
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  const resolveImageUrl = (img?: string) => {
    if (!img) return '/placeholder-product.jpg';
    if (img.startsWith('http')) return img;
    return `${FILE_BASE_URL}${img.replace(/^\/uploads\//, '')}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Load wishlist from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('wishlistItems') || '[]') as { _id: string }[];
      if (Array.isArray(saved)) {
        setWishlist(saved.map((p) => p._id));
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, selectedCategory]);

  // Fetch best sellers explicitly
  useEffect(() => {
    (async () => {
      try {
        const bestRes = await productsAPI.getAll({ limit: 6, page: 1, best: true });
        setBestSellers(bestRes.data?.data || bestRes.data || []);
      } catch {}
    })();
  }, []);

  // Categories functions (simplified)

  const fetchData = async () => {
    try {
      setIsLoadingPage(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ 
          limit: 12,
          page: currentPage,
          search: searchQuery || undefined,
          category: selectedCategory || undefined
        }),
        productsAPI.getCategories()
      ]);
      
      setProducts(productsRes.data.data || productsRes.data);
      setPagination(productsRes.data.pagination);
      setCategories(categoriesRes.data);
      console.log('Categories data:', categoriesRes.data); // Debug log
      try {
        const activeCurrencyRes = await productsAPI.getActiveCurrency();
        if (activeCurrencyRes.data?.symbol) setActiveCurrencySymbol(activeCurrencyRes.data.symbol);
      } catch {}
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingPage(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to products section when page changes
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div className="min-h-screen bg-[#1c1a24]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-2">
        {/* Hero Section with dark purple background and jewelry focus */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14 relative min-h-[700px] flex items-center justify-center overflow-hidden rounded-lg"
          style={{ background: 'url(/bg.jpeg) no-repeat center center', backgroundSize:'cover'}}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}></div>
          </div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="text-center md:text-right">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="inline-block px-6 py-3 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6 border border-white/20"
              >
                <span className="flex items-center">
                  <Gem className="w-4 h-4 mr-2 text-gray-300" />
                  مجوهرات إماراتية يدوية منذ 2019
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              >
                <span className="block">لمسة من الفخامة</span>
                <span className="block text-white/90 text-3xl md:text-4xl lg:text-5xl mt-2">مصنوعة يدوياً خصيصاً لك</span>
                <span className="block text-[gray-300] text-2xl md:text-3xl lg:text-4xl mt-4 font-light">تألقي كالجوهرة</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg text-white/90 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0"
              >
                خواتم، سلاسل، وإكسسوارات إماراتية يدوية مصنوعة خصيصاً لك أو جاهزة. نشتغل بالجملة وبالقطعة للمحلات وللأفراد، ونشحن لكل الدول
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-wrap gap-6 justify-center md:justify-start"
              >
                <motion.a 
                  href="#products" 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-white to-gray-100 text-[#211c31] rounded-full font-semibold shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    شاهد منتجاتنا
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                <motion.a 
                  href="https://wa.me/message/GAYCPDLPDHLSH1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-full font-semibold backdrop-blur-sm overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    تواصل معنا
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-6 text-white/80 text-sm"
              >
                <motion.div 
                  className="flex items-center space-x-2 space-x-reverse bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Truck className="w-4 h-4 text-gray-300" />
                  <span>شحن مجاني</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 space-x-reverse bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Shield className="w-4 h-4 text-gray-300" />
                  <span>ضمان الجودة</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 space-x-reverse bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-4 h-4 text-gray-300" />
                  <span>24/7 دعم</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Image Column */}
            <div className="flex justify-center items-center order-first md:order-last">
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                animate={{ scale: [1, 0.95, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full w-68 h-68 bg-[#251b43] blur-3xl top-[30%] right-[30%]"></div>
                <img 
                  src="/hero-almasya.png" 
                  alt="مجوهرات ألماسيا المميزة" 
                  className="relative w-full max-w-md object-contain drop-shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Categories Section - Modern 4-column grid */}
        <section className="py-20 bg-[#1c1a24]">
          <div className="max-w-7xl mx-auto px-4">
            {/* Section header */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-10 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300/10 border border-gray-300/20 flex items-center justify-center mr-3">
                  <Gem className="w-5 h-5 text-gray-300" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">استكشف الفئات</h2>
              </div>
              <Link href="/categories" className="hidden sm:inline-block">
                <motion.span
                  whileHover={{ x: -4 }}
                  className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-full border border-gray-300/20 hover:border-gray-300/40"
                >
                  عرض المزيد →
                </motion.span>
              </Link>
            </motion.div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayCategories.slice(0, 4).map((category, idx) => (
                <Link key={category._id} href={`/products?category=${encodeURIComponent(category.name || '')}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    whileHover={{ y: -6 }}
                    className="group relative overflow-hidden rounded-2xl bg-[#211c31] border border-white/5 shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={resolveImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-90" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-lg truncate group-hover:text-gray-300 transition-colors">
                          {category.name || 'فئة'}
                        </h3>
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-300/20 text-gray-300 border border-gray-300/20">
                          اكتشف
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* View more (mobile) */}
            <div className="sm:hidden mt-8 text-center">
              <Link href="/categories" className="inline-block">
                <span className="px-4 py-2 text-sm rounded-full bg-gray-300 text-[#1c1a24] font-semibold">عرض جميع الفئات</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature/Trust Badges Section */}
        <section className="py-20 bg-[#211c31]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Truck,
                  title: "شحن مجاني وإرجاع",
                  description: "نقدم شحن مجاني على جميع الطلبات مع ضمان الإرجاع خلال 30 يوم"
                },
                {
                  icon: Shield,
                  title: "ضمان استرداد الأموال",
                  description: "ضمان 100% لاسترداد الأموال إذا لم تكن راضياً عن المنتج"
                },
                {
                  icon: MessageCircle,
                  title: "دعم فني 24/7",
                  description: "فريق الدعم الفني متاح على مدار الساعة لمساعدتك في أي استفسار"
                },
                {
                  icon: Sparkle,
                  title: "عروض منتظمة",
                  description: "احصل على خصومات حصرية وعروض خاصة على منتجاتنا المميزة"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gray-300/10 rounded-full flex items-center justify-center border border-gray-300/20 group-hover:bg-gray-300/20 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        
        {/* Top Selling Products Section - Horizontal Carousel */}
        <section className="py-20 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#251b43] via-[#1c1a24] to-[#211c31]" />
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-10 text-center"
            >
              <div className="inline-flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300/10 border border-gray-300/20 flex items-center justify-center mr-3">
                  <Crown className="w-5 h-5 text-gray-300" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">المنتجات الأكثر مبيعاً</h2>
              </div>
            </motion.div>

            {/* Grid using ProductCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellers.slice(0, 6).map((product, idx) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.06 }}
                >
                  <ProductCard product={product} currencySymbol={activeCurrencySymbol} />
                </motion.div>
              ))}
            </div>

            {/* Pager dots removed with carousel */}

            {/* Show more */}
            <div className="mt-10 text-center">
              <Link href="/products?best=true" className="inline-block">
                <motion.span
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-full bg-gray-300 text-[#1c1a24] font-semibold shadow-md"
                >
                  عرض المزيد
                </motion.span>
              </Link>
            </div>
          </div>
        </section>

        {/* Products Section - Clean E-commerce Design */}
        <section id="products" className="py-16 mb-20 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#211c31] via-[#251b43]/60 to-[#1c1a24]" />
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-sm text-gray-300"
            >
              الصفحة الرئيسية &gt; المنتجات
            </motion.div>
          </div>

          {/* Page Title */}
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-white text-center"
            >
              المنتجات
            </motion.h1>
          </div>

         

          {/* Products Container */}
          <div className="max-w-7xl mx-auto px-4">
            <div className="rounded-2xl shadow-sm p-8 bg-[#1c1a24]/40 border border-white/10">


              {/* Clean Products Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <AnimatePresence mode="wait">
                      {isLoadingPage ? (
                        // Clean Loading skeleton
                        Array.from({ length: 9 }).map((_, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white/10 border border-white/10 rounded-lg p-4 animate-pulse"
                          >
                            <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                            <div className="space-y-3">
                              <div className="bg-gray-200 h-4 rounded"></div>
                              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                              <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        products.map((product, idx) => (
                          <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="group"
                          >
                            <ProductCard product={product} currencySymbol={activeCurrencySymbol} />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Clean Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.6 }}
                      className="flex justify-center items-center space-x-2 space-x-reverse mb-8"
                    >
                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 ${
                          pagination.hasPrevPage
                            ? 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md border border-gray-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        <ChevronRight size={16} />
                        <span className="text-sm">السابق</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1 space-x-reverse">
                        {Array.from({ length: Math.min(10, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 10) {
                            pageNum = i + 1;
                          } else if (currentPage <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 4) {
                            pageNum = pagination.totalPages - 9 + i;
                          } else {
                            pageNum = currentPage - 4 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg transition-all duration-200 text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'bg-gray-800 text-white shadow-md'
                                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md border border-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 ${
                          pagination.hasNextPage
                            ? 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md border border-gray-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        <span className="text-sm">التالي</span>
                        <ChevronLeft size={16} />
                      </button>
                    </motion.div>
                  )}

                  {/* Clean Empty State */}
                  {!isLoading && products.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center py-20"
                    >
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gem className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        لا توجد منتجات
                      </h3>
                      <p className="text-gray-300 max-w-md mx-auto">
                        جرب تغيير الفلاتر أو البحث عن شيء آخر
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section - Modern Design */}
        <section id="faq" className="py-20 mb-16 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#251b43]/20 via-[#211c31]/10 to-[#1c1a24]/20"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block"
              >
                  <span className="text-sm font-bold text-white bg-gradient-to-r from-gray-300/20 to-gray-300/10 px-6 py-3 rounded-full shadow-lg border border-gray-300/30">
                    <HelpCircle className="w-4 h-4 inline mr-2 text-gray-300" />
                    الأسئلة الشائعة
                  </span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent"
              >
                عندك أسئلة؟
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed"
              >
                نجاوب على أكثر الأسئلة شيوعاً لنساعدك في اتخاذ القرار المناسب
              </motion.p>
            </motion.div>

            <div className="space-y-6">
              {[
                { 
                  q: 'كيف أعرف أن المجوهرات مناسبة لي؟', 
                  a: 'نوفر وصفاً دقيقاً وصوراً واضحة لكل قطعة، مع تفاصيل الأبعاد والمواد المستخدمة. يمكنك أيضاً مراسلتنا لأي استفسار إضافي حول المقاسات والتصميمات.' 
                },
                { 
                  q: 'كم يستغرق التوصيل؟', 
                  a: 'عادةً من 2 إلى 5 أيام عمل داخل الإمارات حسب موقعك. نقدم خدمة توصيل سريعة ومضمونة مع تتبع الطلب.' 
                },
                { 
                  q: 'هل أستطيع الإرجاع أو الاستبدال؟', 
                  a: 'نعم، يمكنك الإرجاع أو الاستبدال خلال 7 أيام من الاستلام وفق سياسة الاستبدال والإرجاع الشاملة.' 
                },
                { 
                  q: 'ما هي طرق الدفع المتاحة؟', 
                  a: 'نقبل جميع البطاقات الائتمانية، الدفع عند الاستلام، والتحويل البنكي. جميع المعاملات آمنة ومشفرة.' 
                },
                { 
                  q: 'هل تقدمون خدمة التصميم المخصص؟', 
                  a: 'نعم، نقدم خدمة التصميم المخصص للمجوهرات. يمكنك طلب تصميم خصيصاً لك مع اختيار المواد والأحجار الكريمة.' 
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="group"
                >
                  <details className="group rounded-md border border-white/10 p-6 hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-[#251b43]/50 via-[#211c31]/30 to-[#1c1a24]/50 backdrop-blur-sm">
                    <summary className="cursor-pointer list-none flex items-center justify-between text-right">
                      <span className="font-bold text-white text-lg group-hover:text-gray-300 transition-colors duration-300">{item.q}</span>
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-300/20 to-gray-300/10 rounded-full flex items-center justify-center group-open:bg-gradient-to-r group-open:from-gray-300 group-open:to-gray-400 transition-all duration-300 border border-gray-300/30">
                        <motion.span 
                          className="text-gray-300 group-open:text-[#1c1a24] text-xl font-bold transition-colors duration-300"
                          animate={{ rotate: 0 }}
                          whileHover={{ rotate: 90 }}
                          transition={{ duration: 0.3 }}
                        >
                          +
                        </motion.span>
                      </div>
                    </summary>
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 text-gray-300 leading-relaxed border-t border-white/10 pt-6"
                    >
                      {item.a}
                    </motion.div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Modern Design */}
        <section id="cta" className="py-20 mb-16 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-[#251b43] via-[#211c31] to-[#1c1a24]"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block mb-8"
              >
                <span className="text-sm font-bold text-white bg-gradient-to-r from-gray-300/20 to-gray-300/10 px-6 py-3 rounded-full shadow-lg border border-gray-300/30">
                  <Sparkle className="w-4 h-4 inline mr-2 text-gray-300" />
                  جاهز للبدء؟
                </span>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-6"
              >
                اكتشف مجموعتنا المميزة
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
              >
                خواتم، سلاسل، وإكسسوارات إماراتية يدوية مصنوعة خصيصاً لك أو جاهزة. منتجاتنا وصلت لأكثر من 5 دول
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <motion.a 
                  href="/products" 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-[#1c1a24] rounded-full font-semibold shadow-2xl border border-gray-300/30 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    شاهد منتجاتنا
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="mr-2"
                    >
                      →
                    </motion.span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                
                <motion.a 
                  href="#" 
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gray-300/10 text-white rounded-full font-semibold shadow-2xl border border-gray-300/30 overflow-hidden backdrop-blur-sm"
                >
                  <span className="relative z-10 flex items-center">
                    تواصل معنا
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="mr-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </motion.span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default HomePage;




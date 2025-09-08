'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { useCart } from '../../context/Cart';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { productsAPI } from '../../service/api';

interface Category {
  _id: string;
  name: string;
  isActive?: boolean;
}

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { getTotalItems } = useCart();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await productsAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    const url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    window.location.href = url;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#211c31]/50 backdrop-blur supports-[backdrop-filter]:bg-[#211c31]/70 border-b border-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Search & Mobile Menu (Mobile Only) */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-300 hover:text-[#211c31] rounded-md transition-colors text-gray-300"
            >
              <Search size={20} />
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-300 hover:text-[#211c31] rounded-md transition-colors text-gray-300"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Logo - Centered on Mobile, Left on Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-9 h-9 bg-[#211c31] text-white rounded-md">
              <img src="/logo.png" alt="Almasya Logo" className='w-full h-full rounded-md' />
            </div>
            <span className='text-md font-bold text-gray-300'> Almasya </span>
          </motion.div>

          {/* Desktop Menu - Centered */}
          <nav className="hidden md:flex items-center space-x-2 text-gray-300 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md transition-colors hover:text-white hover:bg-[#211c31]/20 ${pathname === '/' ? 'text-gray-300 font-semibold underline underline-offset-8 decoration-2 decoration-gray-300/50' : ''}`}
            >
              الرئيسية
            </Link>
            <Link
              href="/products"
              className={`px-3 py-2 rounded-md transition-colors hover:text-white hover:bg-[#211c31]/20 ${pathname?.startsWith('/products') ? 'text-gray-300 font-semibold underline underline-offset-8 decoration-2 decoration-gray-300/50' : ''}`}
            >
              المنتجات
            </Link>
            <Link
              href="/categories"
              className={`px-3 py-2 rounded-md transition-colors hover:text-white hover:bg-[#211c31]/20 ${pathname?.startsWith('/categories') ? 'text-gray-300 font-semibold underline underline-offset-8 decoration-2 decoration-gray-300/50' : ''}`}
            >
              الفئات
            </Link>
            <Link
              href="/best-sellers"
              className={`px-3 py-2 rounded-md transition-colors hover:text-white hover:bg-[#211c31]/20 ${pathname === '/best-sellers' ? 'text-gray-300 font-semibold underline underline-offset-8 decoration-2 decoration-gray-300/50' : ''}`}
            >
              الأكثر مبيعاً
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 rounded-md transition-colors hover:text-white hover:bg-[#211c31]/20 ${pathname === '/about' ? 'text-gray-300 font-semibold underline underline-offset-8 decoration-2 decoration-gray-300/50' : ''}`}
            >
              من نحن
            </Link>
            <Link
              href="/contact"
              className={`px-3 py-2 rounded-md transition-colors hover:text-white hover:bg-[#211c31]/20 ${pathname === '/contact' ? 'text-gray-300 font-semibold underline underline-offset-8 decoration-2 decoration-gray-300/50' : ''}`}
            >
              تواصل
            </Link>
          </nav>

          {/* Right Side - Search (Desktop), Cart, User */}
          <div className="flex items-center space-x-2">
            {/* Search - Desktop Only */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden md:block p-2 hover:bg-gray-300 hover:text-[#211c31] rounded-md transition-colors text-gray-300"
            >
              <Search size={20} />
            </motion.button>

            {/* Cart */}
            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-300 hover:text-[#211c31] rounded-md transition-colors relative text-gray-300"
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-gray-300 text-[#211c31] text-xs rounded-md w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              </motion.button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 bg-[#211c31] rounded-md flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <span className="text-white hover:text-[#211c31] font-bold text-lg">
                    {user?.firstLetter}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute -right-32 mt-3 w-56 backdrop-blur-lg bg-gray-300 supports-[backdrop-filter]:bg-[#251b43] rounded-md shadow-xl border border-gray-600 z-50 origin-top-right"
                    >
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-gray-300 hover:bg-[#251b43]/20 text-right rounded-md"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          الملف الشخصي
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-gray-300 hover:bg-[#251b43]/20 text-right rounded-md"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          طلباتي
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-gray-300 hover:bg-[#251b43]/20 text-right rounded-md"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          المفضلة
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-gray-300 hover:bg-[#251b43]/20 text-right rounded-md"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            لوحة التحكم
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-right px-4 py-2 text-gray-300 hover:bg-[#251b43]/20 rounded-md"
                        >
                          تسجيل الخروج
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.location.href = '/login'}
                className="w-10 h-10 bg-[#211c31] rounded-md flex items-center justify-center hover:bg-[#251b43] transition-colors text-gray-300"
              >
                <User size={20} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4 border-t border-gray-600"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="ابحث عن المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#211c31] border border-gray-600 bg-[#251b43] text-white"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-48 px-4 py-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#211c31] appearance-none bg-[#251b43] text-white"
                    disabled={isLoadingCategories}
                  >
                    <option value="">جميع الفئات</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-[#211c31] hover:bg-[#251b43] text-white rounded-md transition-colors font-medium flex items-center justify-center"
                >
                  <Search size={18} className="ml-2" />
                  بحث
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-600"
            >
              <nav className="py-4 space-y-2 text-gray-300">
                <Link href="/" className="block py-2 hover:bg-[#211c31]/20 px-4 rounded-md">
                  الرئيسية
                </Link>
                <Link href="/products" className="block py-2 hover:bg-[#211c31]/20 px-4 rounded-md">
                  المنتجات
                </Link>
                <Link href="/categories" className="block py-2 hover:bg-[#211c31]/20 px-4 rounded-md">
                  الفئات
                </Link>
                <Link href="/about" className="block py-2 hover:bg-[#211c31]/20 px-4 rounded-md">
                  من نحن
                </Link>
                <Link href="/best-sellers" className="block py-2 hover:bg-[#211c31]/20 px-4 rounded-md">
                  الأكثر مبيعاً
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
    {/* Spacer to offset fixed header height */}
    <div className="h-16" />
    </>
  );
};

export default Header;

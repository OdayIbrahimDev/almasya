'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/Auth';
import Header from '../components/layout/Header';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#251b43]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a075ad] mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحقق من تسجيل الدخول...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#a075ad]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">يجب تسجيل الدخول</h2>
          <p className="text-gray-600">يرجى تسجيل الدخول لعرض الملف الشخصي</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-[#251b43] rounded-2xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-[#211c31] to-[gray-300] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">{user.firstLetter}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">الملف الشخصي</h1>
            <p className="text-gray-300">إدارة معلومات حسابك الشخصي</p>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Name Field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#211c31] focus:border-transparent text-right bg-[#251b43] text-white"
                />
              ) : (
                <div className="w-full pr-10 pl-4 py-3 bg-[#1c1a24] rounded-xl text-right text-white">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#211c31] focus:border-transparent text-right bg-[#251b43] text-white"
                />
              ) : (
                <div className="w-full pr-10 pl-4 py-3 bg-[#1c1a24] rounded-xl text-right text-white">
                  {user.email}
                </div>
              )}
            </div>

            {/* Role Display */}
            <div className="relative">
              <div className="w-full px-4 py-3 bg-[#1c1a24] rounded-xl text-right text-white">
                <span className="text-gray-300">الدور: </span>
                <span className={`font-medium ${
                  user.role === 'admin' ? 'text-[gray-300]' : 'text-[#c0a47e]'
                }`}>
                  {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 space-x-reverse">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-300 text-white rounded-xl font-medium hover:from-gray-500 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-[#211c31] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 space-x-reverse"
                  >
                    <Save size={18} />
                    <span>{isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-[#251b43] transition-all duration-200 flex items-center space-x-2 space-x-reverse"
                  >
                    <X size={18} />
                    <span>إلغاء</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-300 text-white rounded-xl font-medium hover:from-gray-500 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-[#211c31] focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2 space-x-reverse"
                >
                  <Edit3 size={18} />
                  <span>تعديل الملف الشخصي</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4 text-right">معلومات إضافية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#251b43] rounded-xl p-4 text-right">
                <p className="text-sm text-gray-300 mb-1">تاريخ الإنشاء</p>
                <p className="font-medium text-white">يناير 2024</p>
              </div>
              <div className="bg-[#251b43] rounded-xl p-4 text-right">
                <p className="text-sm text-gray-300 mb-1">آخر تسجيل دخول</p>
                <p className="font-medium text-white">اليوم</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;

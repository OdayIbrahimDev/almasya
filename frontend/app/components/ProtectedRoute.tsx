"use client";

import { useAuth } from '../context/Auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Home, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (requireAdmin && user?.role !== 'admin') {
        // Logged in but not admin, show access denied
        setShowAccessDenied(true);
      }
    }
  }, [isAuthenticated, isLoading, user, requireAdmin, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-4 border-[#a075ad] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Show access denied page for non-admin users
  if (showAccessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-md shadow-2xl border border-white/40 p-8">
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Shield className="w-8 h-8 text-red-600" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">لا يمكن الوصول لهذه الصفحة</h1>
              <p className="text-gray-600">
                عذراً، هذه الصفحة متاحة فقط للمديرين. لا تملك الصلاحيات المطلوبة للوصول إليها.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-[#a075ad] to-[#8b6a9a] text-white py-3 rounded-md font-semibold hover:from-[#8b6a9a] hover:to-[#7a5a8a] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                العودة للصفحة الرئيسية
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                العودة للصفحة السابقة
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع إدارة الموقع.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show children if user is authenticated and has proper role
  if (isAuthenticated && (!requireAdmin || user?.role === 'admin')) {
    return <>{children}</>;
  }

  // Fallback (should not reach here)
  return null;
};

export default ProtectedRoute;

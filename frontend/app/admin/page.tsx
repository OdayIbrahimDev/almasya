'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, DollarSign, Tag, TrendingUp, Hash, Mail } from 'lucide-react';
import Header from '../components/layout/Header';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/Auth';
import Link from 'next/link';
import { adminAPI } from '../service/api';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  unreadContacts: number;
  recentOrders: any[];
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    unreadContacts: 0,
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if user is authenticated and is an admin
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [usersResponse, productsResponse, ordersResponse, contactsResponse] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getProducts(),
        adminAPI.getOrders(),
        adminAPI.getContacts()
      ]);

      const users = usersResponse.data;
      const products = productsResponse.data;
      const orders = ordersResponse.data;
      const contacts = contactsResponse.data;

      // Calculate total sales from completed orders using finalTotal (includes coupon discounts)
      const totalSales = orders
        .filter((order: any) => order.status === 'delivered')
        .reduce((sum: number, order: any) => sum + (order.finalTotal || order.totalAmount || 0), 0);

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Count unread contacts
      const unreadContacts = contacts.filter((contact: any) => contact.status === 'unread').length;

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalSales,
        unreadContacts,
        recentOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[gray-300]';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'processing': return 'قيد المعالجة';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const statsCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      loading: isLoading
    },
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'from-green-500 to-green-600',
      loading: isLoading
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      loading: isLoading
    },
    {
      title: 'إجمالي المبيعات',
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      loading: isLoading
    },
    {
      title: 'الرسائل الجديدة',
      value: stats.unreadContacts.toString(),
      icon: Mail,
      color: 'from-red-500 to-red-600',
      loading: isLoading
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-[#251b43]">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#251b43]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h1>
          <p className="text-gray-300">مرحباً بك في لوحة تحكم ألماسيا</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-[#251b43] rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-[#251b43] rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/product">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <Package className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-medium text-white">إدارة المنتجات</h3>
                <p className="text-sm text-gray-300">أضف، عدّل، واحذف المنتجات</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/newsletter">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-white">إرسال نشرة بريدية</h3>
                <p className="text-sm text-gray-300">أرسل رسالة لجميع المشتركين</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/category">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <Tag className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="font-medium text-white">إدارة الفئات</h3>
                <p className="text-sm text-gray-300">أضف، عدّل، واحذف الفئات</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/currency">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <DollarSign className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-medium text-white">إدارة العملات</h3>
                <p className="text-sm text-gray-300">أضف، عدّل، واحذف العملات</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/offers">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <Tag className="w-8 h-8 text-red-500 mb-2" />
                <h3 className="font-medium text-white">إدارة العروض</h3>
                <p className="text-sm text-gray-300">إنشاء وإدارة عروض الخصم</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/coupons">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <Hash className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="font-medium text-white">إدارة الكوبونات</h3>
                <p className="text-sm text-gray-300">إنشاء وإدارة كوبونات الخصم</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/contact">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <Users className="w-8 h-8 text-indigo-500 mb-2" />
                <h3 className="font-medium text-white">رسائل التواصل</h3>
                <p className="text-sm text-gray-300">عرض وإدارة رسائل العملاء</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/newsletter">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <Mail className="w-8 h-8 text-pink-500 mb-2" />
                <h3 className="font-medium text-white">النشرة الإخبارية</h3>
                <p className="text-sm text-gray-300">إرسال وإدارة النشرات الإخبارية</p>
              </motion.button>
            </Link>
            
            <Link href="/admin/user">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors text-right bg-[#251b43]"
              >
                <Users className="w-8 h-8 text-orange-500 mb-2" />
                <h3 className="font-medium text-white">إدارة المستخدمين</h3>
                <p className="text-sm text-gray-300">عرض وتعديل حسابات المستخدمين</p>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-[#251b43] rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">الطلبات الأخيرة</h2>
            <Link href="/admin/order" className="text-[gray-300] hover:text-[#c3a57a] font-medium transition-colors">
              عرض جميع الطلبات
            </Link>
          </div>
          
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${getStatusColor(order.status)} rounded-full`}></div>
                    <div className="text-right">
                      <span className="text-gray-700 font-medium">طلب #{order._id.slice(-6)}</span>
                      <div className="text-sm text-gray-500">
                        {order.customerName || 'عميل'} - {formatCurrency(order.finalTotal || order.totalAmount || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-[gray-300]/20 text-[gray-300]' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(order.status)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد طلبات حديثة
            </div>
          )}
        </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;

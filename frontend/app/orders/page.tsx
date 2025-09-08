'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/Auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '../service/api';

interface OrderItem {
  product?: {
    _id: string;
    name: string;
    images?: string[];
  } | null;
  _id?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  products: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  couponDiscount?: number;
  finalTotal?: number;
  appliedCoupon?: {
    couponId: string;
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod?: string;
  shippingAddress?: any;
  currency?: { symbol: string; code: string };
  createdAt: string;
  updatedAt?: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await ordersAPI.my();
      setOrders(res.data || []);
    } catch (e) {
      console.error('Load orders error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-[gray-300]" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[gray-300]/20 text-[gray-300]';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = selectedStatus 
    ? orders.filter(order => order.status === selectedStatus)
    : orders;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#a075ad]/10">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
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
    <div className="min-h-screen">
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">طلباتي</h1>
              <p className="text-gray-600">تاريخ طلباتك وتتبع حالتها</p>
            </div>
            <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700">
              <ArrowLeft size={20} className="ml-2" />
              العودة للرئيسية
            </Link>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">تصفية حسب الحالة:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">جميع الطلبات</option>
              <option value="pending">في الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التوصيل</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} className="text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">لا توجد طلبات</h2>
            <p className="text-gray-600 mb-8">لم تقم بعمل أي طلبات بعد</p>
            <Link
              href="/products"
              className="inline-flex items-center bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
            >
              <Package size={20} className="ml-2" />
              تصفح المنتجات
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        رقم الطلب: {order._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {order.products.map((item) => (
                      <div key={item.product?._id || item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.product?.name || 'منتج محذوف'}</h4>
                          <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-600">{item.price} {order.currency?.symbol || 'د.أ'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">تفاصيل الشحن</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shippingAddress?.street}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                        <p>{order.shippingAddress?.zipCode}</p>
                        <p>{order.shippingAddress?.country}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">تفاصيل الدفع</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>طريقة الدفع: الدفع عند الاستلام</p>
                        {order.subtotal && (
                          <p>المجموع الفرعي: <span className="font-medium">{order.subtotal} {order.currency?.symbol || 'د.أ'}</span></p>
                        )}
                        {order.appliedCoupon && order.couponDiscount && order.couponDiscount > 0 && (
                          <p>خصم الكوبون ({order.appliedCoupon.code}): <span className="text-green-600 font-medium">-{order.couponDiscount} {order.currency?.symbol || 'د.أ'}</span></p>
                        )}
                        <p>المبلغ الإجمالي: <span className="font-semibold text紫-600">{order.finalTotal || order.totalAmount} {order.currency?.symbol || 'د.أ'}</span></p>
                      </div>
                    </div>
                  </div>

                  {(order.status === 'pending' || order.status === 'processing') && (
                    <div className="flex justify-end">
                      <button
                        onClick={async () => { 
                          try { 
                            await ordersAPI.cancel(order._id); 
                            await fetchOrders(); 
                          } catch (e) { 
                            console.error(e); 
                            // You can add a toast notification here instead of alert
                            console.log('تعذر إلغاء الطلب');
                          } 
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        إلغاء الطلب
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye } from 'lucide-react';
import Header from '../../components/layout/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/Auth';
import { adminAPI } from '../../service/api';
import AdminTable from '../../components/ui/AdminTable';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  products: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    state: string;
  };
  phone: string;
  createdAt: string;
}

const AdminOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showInfo, showSuccess, showError, closeModal } = useModal();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      const allOrders = response.data;
      setOrders(allOrders);
      
      // Calculate total pages
      const total = Math.ceil(allOrders.length / ordersPerPage);
      setTotalPages(total);
      
      // Reset to first page if current page is out of bounds
      if (currentPage > total) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get orders for current page
  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return orders.slice(startIndex, endIndex);
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getAllAvailableStatuses = (currentStatus: string) => {
    const allStatuses = [
      { value: 'pending', label: 'في الانتظار' },
      { value: 'processing', label: 'قيد المعالجة' },
      { value: 'shipped', label: 'تم الشحن' },
      { value: 'delivered', label: 'تم التسليم' },
      { value: 'cancelled', label: 'ملغي' }
    ];
    
    // Filter out current status and apply logical restrictions
    return allStatuses.filter(status => {
      if (status.value === currentStatus) return false;
      
      // Special rules for pending orders
      if (currentStatus === 'pending') {
        // Pending orders can go to any status except 'pending' (current)
        return true;
      }
      
      // For other statuses, prevent going backwards in most cases
      if (currentStatus === 'processing') {
        // Processing can go to shipped, delivered, or cancelled (but not back to pending)
        return ['shipped', 'delivered', 'cancelled'].includes(status.value);
      }
      
      if (currentStatus === 'shipped') {
        // Shipped can go to delivered or cancelled (but not back to processing/pending)
        return ['delivered', 'cancelled'].includes(status.value);
      }
      
      if (currentStatus === 'delivered') {
        // Delivered is final, can only be cancelled
        return status.value === 'cancelled';
      }
      
      if (currentStatus === 'cancelled') {
        // Cancelled is final, no further changes
        return false;
      }
      
      return true;
    });
  };

  const handleStatusUpdate = async (order: Order, newStatus: string, newStatusLabel: string) => {
    showConfirm(
      `هل تريد تغيير حالة الطلب من "${getStatusText(order.status)}" إلى "${newStatusLabel}"؟`,
      async () => {
        try {
          await adminAPI.updateOrderStatus(order._id, newStatus);
          showSuccess('تم تحديث حالة الطلب بنجاح');
          fetchOrders(); // Refresh the orders list
        } catch (error) {
          console.error('Error updating order status:', error);
          showError('حدث خطأ أثناء تحديث حالة الطلب');
        }
      }
    );
  };

  const handleView = (order: Order) => {
    const userName = order.user?.name || 'مستخدم محذوف';
    const userEmail = order.user?.email || 'غير محدد';
    const totalAmount = order.totalAmount || 0;
    const status = getStatusText(order.status);
    const createdAt = new Date(order.createdAt).toLocaleDateString('ar-EG');
    
    // Build products list
    let productsText = '';
    if (order.products && order.products.length > 0) {
      productsText = order.products.map((item, index) => {
        const productName = item.product?.name || 'منتج محذوف';
        const quantity = item.quantity || 1;
        return `${index + 1}. ${productName} (الكمية: ${quantity})`;
      }).join('\n');
    } else {
      productsText = 'لا توجد منتجات';
    }
    
    showInfo(
      `تفاصيل الطلب: ${order._id}\n\nالمستخدم: ${userName}\nالبريد الإلكتروني: ${userEmail}\nالمبلغ: ${totalAmount} د.أ\nالحالة: ${status}\nالتاريخ: ${createdAt}\n\nالمنتجات:\n${productsText}`,
      'تفاصيل الطلب'
    );
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const filterOptions = [
    {
      key: 'status',
      label: 'حالة الطلب',
      type: 'select' as const,
      options: [
        { value: 'pending', label: 'في الانتظار' },
        { value: 'processing', label: 'قيد المعالجة' },
        { value: 'shipped', label: 'تم الشحن' },
        { value: 'delivered', label: 'تم التسليم' },
        { value: 'cancelled', label: 'ملغي' }
      ]
    },
    {
      key: 'createdAt',
      label: 'تاريخ الطلب',
      type: 'date' as const
    }
  ];

  const tableColumns = [
    {
      key: 'user',
      label: 'المستخدم',
      render: (value: any) => (
        <div>
          {value ? (
            <>
              <div className="font-medium text-gray-900">{value.name || 'غير محدد'}</div>
              <div className="text-sm text-gray-500">{value.email || 'غير محدد'}</div>
            </>
          ) : (
            <span className="text-gray-500 text-sm">مستخدم محذوف</span>
          )}
        </div>
      )
    },
    {
      key: 'products',
      label: 'المنتجات',
      render: (value: any[]) => (
        <div className="text-sm">
          {value && value.length > 0 ? (
            <>
              <div className="font-medium text-gray-900">
                {value.length} منتج
              </div>
              <div className="text-gray-500">
                {value.slice(0, 2).map((item, index) => {
                  const productName = item.product?.name || 'منتج محذوف';
                  return productName;
                }).join(', ')}
                {value.length > 2 && '...'}
              </div>
            </>
          ) : (
            <span className="text-gray-500">لا توجد منتجات</span>
          )}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'المبلغ الإجمالي',
      render: (value: number, item: Order) => (
        <div className="text-sm">
          {item.subtotal && (
            <div className="text-gray-600">المجموع: {item.subtotal.toLocaleString('ar-EG')} د.أ</div>
          )}
          {item.appliedCoupon && item.couponDiscount && item.couponDiscount > 0 && (
            <div className="text-green-600">خصم: -{item.couponDiscount.toLocaleString('ar-EG')} د.أ</div>
          )}
          <div className="font-semibold text-gray-900">
            {item.finalTotal ? item.finalTotal.toLocaleString('ar-EG') : value.toLocaleString('ar-EG')} د.أ
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (value: string, item: Order) => {
        const availableStatuses = getAllAvailableStatuses(value);
        return (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
              {getStatusText(value)}
            </span>
            {availableStatuses.length > 0 && (
              <div className="relative group">
                <button
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                  title="تغيير الحالة"
                >
                  <span>⚙️</span>
                  <span className="text-xs">تغيير</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-32">
                  {availableStatuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusUpdate(item, status.value, status.label)}
                      className="w-full px-3 py-2 text-xs text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'shippingAddress',
      label: 'العنوان',
      render: (value: any) => (
        <div className="text-sm text-gray-600">
          {value ? (
            <>
              <div>{value.street || 'غير محدد'}</div>
              <div>{value.state || 'غير محدد'}</div>
            </>
          ) : (
            <span className="text-gray-500">غير محدد</span>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'رقم الجوال',
      render: (value: string) => (
        <span className="text-sm text-gray-900">
          {value || 'غير محدد'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'تاريخ الطلب',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString('ar-EG') : 'غير محدد'}
        </span>
      )
    }
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft size={20} />
              العودة للوحة التحكم
            </Link>
          </div>

          <AdminTable
            title="إدارة الطلبات"
            subtitle="عرض وإدارة جميع طلبات العملاء"
            columns={tableColumns}
            data={getCurrentPageOrders()}
            onView={handleView}
            searchPlaceholder="البحث في الطلبات..."
            isLoading={isLoading}
            filters={filterOptions}
          />

          {/* Page Info */}
          <div className="mt-4 text-center text-sm text-gray-600">
            عرض {((currentPage - 1) * ordersPerPage) + 1} إلى {Math.min(currentPage * ordersPerPage, orders.length)} من أصل {orders.length} طلب
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-[#a075ad] text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        size={modalState.size}
      />
    </ProtectedRoute>
  );
};

export default AdminOrders;

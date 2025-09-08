'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/Auth';
import { adminAPI } from '../../service/api';
import AdminForm from '../../components/ui/AdminForm';
import AdminTable from '../../components/ui/AdminTable';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';
import Header from '@/app/components/layout/Header';

interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  scope: 'all' | 'category' | 'products';
  category?: { _id: string; name: string };
  products?: Array<{ _id: string; name: string }>;
  startDate: string | null;
  endDate?: string | null;
  isActive: boolean;
  usedCount: number;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
}

const AdminCouponsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showSuccess, showError, closeModal } = useModal();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchCoupons();
      fetchCategories();
      fetchProducts();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchCoupons = async () => {
    try {
      const response = await adminAPI.getCoupons();
      console.log('Raw coupons response:', response);
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (data: any) => {
      setIsSubmitting(true);
    try {
      const processedData = {
        ...data,
        isActive: data.isActive === 'true' || data.isActive === true
      };
      
      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon._id, processedData);
        showSuccess('تم التحديث بنجاح', 'تم تحديث الكوبون بنجاح');
      } else {
        await adminAPI.createCoupon(processedData);
        showSuccess('تم الإنشاء بنجاح', 'تم إنشاء الكوبون بنجاح');
      }
      
      setShowForm(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error) {
        console.error('Error submitting coupon:', error);
      showError('حدث خطأ أثناء العملية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (coupon: Coupon) => {
    showConfirm(
      `هل أنت متأكد من حذف الكوبون "${coupon.name}"؟`,
      async () => {
        try {
          await adminAPI.deleteCoupon(coupon._id);
          fetchCoupons();
          showSuccess('تم حذف الكوبون بنجاح');
        } catch (error) {
          console.error('Error deleting coupon:', error);
          showError('حدث خطأ أثناء حذف الكوبون');
        }
      }
    );
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await adminAPI.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      showSuccess('تم التحديث بنجاح', 'تم تحديث حالة الكوبون بنجاح');
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      showError('حدث خطأ أثناء التحديث');
    }
  };

  const getInitialData = () => {
    if (editingCoupon) {
      return {
        code: editingCoupon.code,
        name: editingCoupon.name,
        description: editingCoupon.description || '',
        type: editingCoupon.type,
        value: editingCoupon.value,
        minOrderAmount: editingCoupon.minOrderAmount,
        maxDiscount: editingCoupon.maxDiscount || '',
        usageLimit: editingCoupon.usageLimit || '',
        scope: editingCoupon.scope,
        category: editingCoupon.category?._id || '',
        products: editingCoupon.products?.map(p => p._id) || [],
        startDate: editingCoupon.startDate ? editingCoupon.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: editingCoupon.endDate ? editingCoupon.endDate.split('T')[0] : '',
        isActive: editingCoupon.isActive ? 'true' : 'false'
      };
    }
    
    return {
      code: '',
      name: '',
      description: '',
      type: 'percentage' as const,
      value: 10,
      minOrderAmount: 0,
      maxDiscount: '',
      usageLimit: '',
      scope: 'all' as const,
      category: '',
      products: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: 'true'
    };
  };

  const formFields = [
    {
      name: 'code',
      label: 'رمز الكوبون',
      type: 'text' as const,
      required: true,
      placeholder: 'مثال: SUMMER2024'
    },
    {
      name: 'name',
      label: 'اسم الكوبون',
      type: 'text' as const,
      required: true,
      placeholder: 'اسم الكوبون'
    },
    {
      name: 'description',
      label: 'وصف الكوبون',
      type: 'textarea' as const,
      required: false,
      placeholder: 'وصف الكوبون (اختياري)'
    },
    {
      name: 'type',
      label: 'نوع الخصم',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'percentage', label: 'نسبة مئوية (%)' },
        { value: 'fixed', label: 'قيمة ثابتة (د.أ)' }
      ]
    },
    {
      name: 'value',
      label: 'قيمة الخصم',
      type: 'number' as const,
      required: true,
      min: 1,
      placeholder: '10'
    },
    {
      name: 'minOrderAmount',
      label: 'الحد الأدنى للطلب',
      type: 'number' as const,
      required: true,
      min: 0,
      placeholder: '0'
    },
    {
      name: 'maxDiscount',
      label: 'الحد الأقصى للخصم (اختياري)',
      type: 'number' as const,
      required: false,
      min: 0,
      placeholder: '100'
    },
    {
      name: 'usageLimit',
      label: 'حد الاستخدام (اختياري)',
      type: 'number' as const,
      required: false,
      min: 1,
      placeholder: '100'
    },
    {
      name: 'scope',
      label: 'نطاق التطبيق',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'all', label: 'جميع المنتجات' },
        { value: 'category', label: 'فئة محددة' },
        { value: 'products', label: 'منتجات محددة' }
      ]
    },
    {
      name: 'category',
      label: 'اختر الفئة',
      type: 'select' as const,
      required: false,
      options: categories.map(cat => ({ value: cat._id, label: cat.name })),
      showWhen: (data: any) => data.scope === 'category'
    },
    {
      name: 'products',
      label: 'اختر المنتجات',
      type: 'multiselect' as const,
      required: false,
      options: products.map(p => ({ value: p._id, label: `${p.name} - ${p.price} د.أ` })),
      showWhen: (data: any) => data.scope === 'products'
    },
    {
      name: 'startDate',
      label: 'تاريخ البداية',
      type: 'date' as const,
      required: true
    },
    {
      name: 'endDate',
      label: 'تاريخ الانتهاء (اختياري)',
      type: 'date' as const,
      required: false
    },
    {
      name: 'isActive',
      label: 'حالة الكوبون',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ]
    }
  ];

  const tableColumns = [
    {
      key: 'code',
      label: 'الرمز',
      render: (value: string) => (
        <span className="bg-[#251b43]/20 text-[gray-300] px-2 py-1 rounded-full text-sm font-medium">{value}</span>
      )
    },
    {
      key: 'name',
      label: 'الاسم',
      render: (value: string, item: Coupon) => (
          <div>
          <div className="font-semibold text-white">{value}</div>
          {item.description && (
            <div className="text-sm text-gray-300 truncate max-w-xs">{item.description}</div>
            )}
          </div>
      )
    },
    {
      key: 'value',
      label: 'الخصم',
      render: (value: number, item: Coupon) => (
        <div className="text-center">
          <div className="flex items-center gap-1 text-lg font-bold text-[gray-300]">
            <span>{value}</span>
            {item.type === 'percentage' ? '%' : 'د.أ'}
          </div>
          <p className="text-xs text-gray-400">
            {item.type === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}
          </p>
        </div>
      )
    },
    {
      key: 'scope',
      label: 'النطاق',
      render: (value: string, item: Coupon) => (
        <div className="text-sm">
          {value === 'all' && (
            <span className="px-2 py-1 bg-[#251b43]/20 text-[gray-300] rounded-full text-xs">
              جميع المنتجات
            </span>
          )}
          {value === 'category' && item.category && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
              {item.category.name}
            </span>
          )}
          {value === 'products' && item.products && (
            <span className="px-2 py-1 bg-[gray-300]/20 text-[gray-300] rounded-full text-xs">
              {item.products.length} منتج
        </span>
          )}
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'التواريخ',
      render: (value: string, item: Coupon) => (
            <div className="text-sm text-gray-300">
          <div>من: {value ? new Date(value).toLocaleDateString('ar-EG') : 'غير محدد'}</div>
          {item.endDate && (
            <div>إلى: {new Date(item.endDate).toLocaleDateString('ar-EG')}</div>
              )}
            </div>
      )
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: boolean, item: Coupon) => (
        <button
          onClick={() => handleToggle(item)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            value
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-[#251b43]/20 text-gray-300 hover:bg-[#251b43]/30'
          }`}
        >
          {value ? 'نشط' : 'غير نشط'}
        </button>
      )
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (value: string) => (
          <span className="text-sm text-gray-300">
          {value ? new Date(value).toLocaleDateString('ar-EG') : 'غير محدد'}
          </span>
      )
    }
  ];

  const filterOptions = [
    {
      key: 'isActive',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: '', label: 'الكل' },
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ]
    },
    {
      key: 'type',
      label: 'النوع',
      type: 'select' as const,
      options: [
        { value: '', label: 'الكل' },
        { value: 'percentage', label: 'نسبة مئوية' },
        { value: 'fixed', label: 'قيمة ثابتة' }
      ]
    }
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
    <div className="min-h-screen bg-[#251b43]">
        <Header />
        
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#251b43]">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            العودة للوحة التحكم
          </Link>
        </div>

        {showForm ? (
          <AdminForm
            title={editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
            subtitle={editingCoupon ? 'قم بتعديل بيانات الكوبون' : 'أضف كوبون جديد للمتجر'}
              fields={formFields as any}
            initialData={getInitialData()}
            onSubmit={handleSubmit}
              onCancel={handleCancel}
            submitText={editingCoupon ? 'تحديث الكوبون' : 'إضافة الكوبون'}
            isLoading={isSubmitting}
            mode={editingCoupon ? 'edit' : 'create'}
          />
        ) : (
          <AdminTable
            title="إدارة الكوبونات"
            subtitle="أضف، عدّل، واحذف كوبونات الخصم"
            columns={tableColumns}
            data={coupons}
              onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="البحث في الكوبونات..."
            isLoading={isLoading}
              filters={filterOptions as any}
          />
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

export default AdminCouponsPage;

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Tag, Package, Grid3X3, ArrowLeft } from 'lucide-react';
import { adminAPI, productsAPI } from '../../service/api';
import Header from '../../components/layout/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminForm from '../../components/ui/AdminForm';
import AdminTable from '../../components/ui/AdminTable';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';

interface Offer {
  _id: string;
  name: string;
  percentage: number;
  scope: 'all' | 'category' | 'products';
  category?: { _id: string; name: string };
  products?: Array<{ _id: string; name: string; price: number }>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
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

const AdminOffersPage = () => {
  const { modalState, showConfirm, showSuccess, showError, closeModal } = useModal();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [offersRes, categoriesRes, productsRes] = await Promise.all([
        adminAPI.listOffers(),
        productsAPI.getCategories(),
        adminAPI.getProducts()
      ]);

      setOffers(offersRes.data || []);
      setCategories(categoriesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined
      };

      if (editingOffer) {
        await adminAPI.updateOffer(editingOffer._id, submitData);
      } else {
        await adminAPI.createOffer(submitData);
      }

      setShowForm(false);
      setEditingOffer(null);
      fetchData();
      showSuccess(editingOffer ? 'تم تحديث العرض بنجاح' : 'تم إنشاء العرض بنجاح');
    } catch (error) {
      console.error('Error saving offer:', error);
      showError('حدث خطأ في حفظ العرض');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleDelete = async (offerId: string) => {
    showConfirm(
      'هل أنت متأكد من حذف هذا العرض؟',
      async () => {
        try {
          await adminAPI.deleteOffer(offerId);
          fetchData();
          showSuccess('تم حذف العرض بنجاح');
        } catch (error) {
          console.error('Error deleting offer:', error);
          showError('حدث خطأ في حذف العرض');
        }
      }
    );
  };

  const handleToggle = async (offerId: string) => {
    try {
      await adminAPI.toggleOffer(offerId);
      fetchData();
      showSuccess('تم تغيير حالة العرض بنجاح');
    } catch (error) {
      console.error('Error toggling offer:', error);
      showError('حدث خطأ في تغيير حالة العرض');
    }
  };

  const formFields = [
    {
      name: 'name',
      label: 'اسم العرض',
      type: 'text' as const,
      placeholder: 'أدخل اسم العرض',
      required: true
    },
    {
      name: 'percentage',
      label: 'نسبة الخصم (%)',
      type: 'number' as const,
      placeholder: 'مثال: 50',
      min: 1,
      max: 100,
      required: true
    },
    {
      name: 'scope',
      label: 'نطاق التطبيق',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'جميع المنتجات' },
        { value: 'category', label: 'فئة محددة' },
        { value: 'products', label: 'منتجات محددة' }
      ],
      required: true
    },
    {
      name: 'category',
      label: 'اختر الفئة',
      type: 'select' as const,
      options: categories.map(cat => ({ value: cat._id, label: cat.name })),
      required: false,
      showWhen: (data: any) => data.scope === 'category'
    },
    {
      name: 'products',
      label: 'اختر المنتجات',
      type: 'multiselect' as const,
      options: products.map(p => ({ value: p._id, label: `${p.name} - ${p.price} د.أ` })),
      required: false,
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
    }
  ];

  const getInitialData = () => {
    if (editingOffer) {
      return {
        name: editingOffer.name,
        percentage: editingOffer.percentage,
        scope: editingOffer.scope,
        category: editingOffer.category?._id || '',
        products: editingOffer.products?.map(p => p._id) || [],
        startDate: new Date(editingOffer.startDate).toISOString().split('T')[0],
        endDate: editingOffer.endDate ? new Date(editingOffer.endDate).toISOString().split('T')[0] : ''
      };
    }
    return {
      name: '',
      percentage: 100,
      scope: 'all',
      category: '',
      products: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    };
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'all': return 'جميع المنتجات';
      case 'category': return 'فئة محددة';
      case 'products': return 'منتجات محددة';
      default: return scope;
    }
  };

  const tableColumns = [
    {
      key: 'name',
      label: 'اسم العرض'
    },
    {
      key: 'percentage',
      label: 'نسبة الخصم',
      render: (value: number) => (
        <span className="text-2xl font-bold text-[gray-300]">{value}%</span>
      )
    },
    {
      key: 'scope',
      label: 'نطاق التطبيق',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#251b43]/20 text-[gray-300]">
            {getScopeIcon(value)}
          </div>
          <span>{getScopeLabel(value)}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'الفئة',
      render: (value: any) => (
        <span className="text-sm text-gray-300">
          {value ? value.name : '-'}
        </span>
      )
    },
    {
      key: 'products',
      label: 'المنتجات',
      render: (value: any[]) => (
        <span className="text-sm text-gray-300">
          {value && value.length > 0 ? `${value.length} منتج` : '-'}
        </span>
      )
    },
    {
      key: 'startDate',
      label: 'تاريخ البداية',
      render: (value: string) => (
        <span className="text-sm text-gray-300">
          {new Date(value).toLocaleDateString('ar-EG')}
        </span>
      )
    },
    {
      key: 'endDate',
      label: 'تاريخ الانتهاء',
      render: (value: string) => (
        <span className="text-sm text-gray-300">
          {value ? new Date(value).toLocaleDateString('ar-EG') : '-'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: boolean, item: Offer) => (
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-500/20 text-green-400' : 'bg-[#251b43]/20 text-gray-300'
          }`}>
            {value ? 'نشط' : 'غير نشط'}
          </span>
          <button
            onClick={() => handleToggle(item._id)}
            className={`p-2 rounded-lg transition-colors ${
              value 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-[#251b43]/20 text-gray-300 hover:bg-[#251b43]/30'
            }`}
            title={value ? 'إلغاء التفعيل' : 'تفعيل'}
          >
            {value ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: (value: string) => (
        <span className="text-sm text-gray-400">
          {new Date(value).toLocaleDateString('ar-EG')}
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
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ]
    },
    {
      key: 'scope',
      label: 'نطاق التطبيق',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'جميع المنتجات' },
        { value: 'category', label: 'فئة محددة' },
        { value: 'products', label: 'منتجات محددة' }
      ]
    }
  ];

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'all': return <Grid3X3 size={20} />;
      case 'category': return <Tag size={20} />;
      case 'products': return <Package size={20} />;
      default: return <Tag size={20} />;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#251b43]">
          <Header />
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-[#a075ad] border-t-transparent rounded-full"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
              title={editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
              subtitle={editingOffer ? 'قم بتعديل بيانات العرض' : 'أضف عرض جديد للمتجر'}
              fields={formFields}
              initialData={getInitialData()}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingOffer(null);
              }}
              submitText={editingOffer ? 'تحديث العرض' : 'إضافة العرض'}
              isLoading={isSubmitting}
              mode={editingOffer ? 'edit' : 'create'}
            />
          ) : (
            <AdminTable
              title="إدارة العروض"
              subtitle="أضف، عدّل، واحذف عروض الخصم"
              columns={tableColumns}
              data={offers}
              onAdd={() => setShowForm(true)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="البحث في العروض..."
              isLoading={isLoading}
              filters={filterOptions}
            />
          )}


        </main>

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
      </div>
    </ProtectedRoute>
  );
};

export default AdminOffersPage;

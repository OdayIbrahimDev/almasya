'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Package, ArrowLeft } from 'lucide-react';
import Header from '../../components/layout/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/Auth';
import { adminAPI, FILE_BASE_URL } from '../../service/api';
import AdminForm from '../../components/ui/AdminForm';
import AdminTable from '../../components/ui/AdminTable';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  currency: string;
  category: string;
  image?: string;
  inStock: boolean;
  isBestSeller?: boolean;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Currency {
  _id: string;
  name: string;
  symbol: string;
  code: string;
}

const AdminProducts = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showSuccess, showError, closeModal } = useModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchProducts();
      fetchCategories();
      fetchCurrencies();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getProducts();
      const raw = response.data as unknown as Array<{ category: string | { _id?: string } }>;
      const normalized = Array.isArray(raw)
        ? raw.map((p) => ({
            ...(p as any),
            category: typeof p.category === 'object' && (p.category as any)?._id ? (p.category as any)._id : (p.category as any)
          }))
        : (response.data as any);
      setProducts(normalized);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const fetchCurrencies = async () => {
    try {
      const response = await adminAPI.getCurrencies();
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('description', data.description);
      fd.append('price', data.price);
      if (data.offerPrice) fd.append('offerPrice', data.offerPrice);
      fd.append('category', data.category);
      fd.append('inStock', String(data.inStock));
      if (data.image) fd.append('image', data.image);
      fd.append('isBestSeller', String(data.isBestSeller));

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, fd);
      } else {
        await adminAPI.createProduct(fd);
      }

      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
      showSuccess(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إنشاء المنتج بنجاح');
    } catch (error) {
      console.error('Error saving product:', error);
      showError('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    showConfirm(
      `هل أنت متأكد من حذف المنتج "${product.name}"؟`,
      async () => {
        try {
          await adminAPI.deleteProduct(product._id);
          fetchProducts();
          showSuccess('تم حذف المنتج بنجاح');
        } catch (error) {
          console.error('Error deleting product:', error);
          showError('حدث خطأ أثناء حذف المنتج');
        }
      }
    );
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const formFields = [
    {
      name: 'name',
      label: 'اسم المنتج',
      type: 'text' as const,
      placeholder: 'أدخل اسم المنتج',
      required: true
    },
    {
      name: 'description',
      label: 'وصف المنتج',
      type: 'textarea' as const,
      placeholder: 'أدخل وصف المنتج',
      required: true
    },
    {
      name: 'price',
      label: 'السعر',
      type: 'number' as const,
      placeholder: 'أدخل السعر',
      required: true,
      validation: (value: string) => {
        if (isNaN(Number(value)) || Number(value) <= 0) {
          return 'السعر يجب أن يكون رقم موجب';
        }
        return null;
      }
    },
    {
      name: 'offerPrice',
      label: 'سعر العرض',
      type: 'number' as const,
      placeholder: 'أدخل سعر العرض (اختياري)',
      validation: (value: string) => {
        if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
          return 'سعر العرض يجب أن يكون رقم موجب';
        }
        return null;
      }
    },
    {
      name: 'category',
      label: 'الفئة',
      type: 'select' as const,
      required: true,
      options: categories.map(cat => ({ value: cat._id, label: cat.name }))
    },
    {
      name: 'image',
      label: 'صورة المنتج',
      type: 'file' as const,
      required: !editingProduct // Only required for new products
    },
    {
      name: 'inStock',
      label: 'متوفر في المخزون',
      type: 'checkbox' as const
    },
    {
      name: 'isBestSeller',
      label: 'منتج مميز',
      type: 'checkbox' as const
    }
  ];

  const tableColumns = [
    {
      key: 'image',
      label: 'الصورة',
      render: (value: string, item: Product) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={value ? `${process.env.NEXT_PUBLIC_FILE_BASE_URL || 'https://almasya.com/uploads/'}${value.replace(/^\/uploads\//, '')}` : '/placeholder-product.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )
    },
    {
      key: 'name',
      label: 'اسم المنتج'
    },
    {
      key: 'price',
      label: 'السعر',
      render: (value: number, item: Product) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {value.toLocaleString('ar-EG')} د.أ
          </div>
          {item.offerPrice && (
            <div className="text-sm text-gray-500 line-through">
              {item.offerPrice.toLocaleString('ar-EG')} د.أ
            </div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'الفئة',
      render: (value: string) => {
        const category = categories.find(cat => cat._id === value);
        return category?.name || value;
      }
    },
    {
      key: 'inStock',
      label: 'الحالة',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'متوفر' : 'غير متوفر'}
        </span>
      )
    },
    {
      key: 'isBestSeller',
      label: 'مميز',
      render: (value: boolean) => (
        value && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[gray-300]/20 text-[gray-300]">
            مميز
          </span>
        )
      )
    }
  ];

  const filterOptions = [
    {
      key: 'category',
      label: 'الفئة',
      type: 'select' as const,
      options: categories.map(cat => ({ value: cat._id, label: cat.name }))
    },
    {
      key: 'inStock',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'متوفر' },
        { value: 'false', label: 'غير متوفر' }
      ]
    },
    {
      key: 'isBestSeller',
      label: 'منتج مميز',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'مميز' },
        { value: 'false', label: 'عادي' }
      ]
    }
  ];

  const getInitialData = () => {
    if (editingProduct) {
      return {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price.toString(),
        offerPrice: editingProduct.offerPrice?.toString() || '',
        category: editingProduct.category,
        inStock: editingProduct.inStock,
        isBestSeller: Boolean(editingProduct.isBestSeller)
      };
    }
    return {
      name: '',
      description: '',
      price: '',
      offerPrice: '',
      category: '',
      inStock: true,
      isBestSeller: false
    };
  };

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

          {showForm ? (
            <AdminForm
              title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              subtitle={editingProduct ? 'قم بتعديل بيانات المنتج' : 'أضف منتج جديد للمتجر'}
              fields={formFields}
              initialData={getInitialData()}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
              isLoading={isSubmitting}
              mode={editingProduct ? 'edit' : 'create'}
            />
          ) : (
            <AdminTable
              title="إدارة المنتجات"
              subtitle="أضف، عدّل، واحذف منتجات المتجر"
              columns={tableColumns}
              data={products}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="البحث في المنتجات..."
              isLoading={isLoading}
              filters={filterOptions}
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

export default AdminProducts;

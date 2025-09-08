'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/Auth';
import { adminAPI, FILE_BASE_URL } from '../../service/api';
import AdminForm from '../../components/ui/AdminForm';
import AdminTable from '../../components/ui/AdminTable';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';
import Header from '@/app/components/layout/Header';
interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  image?: File;
  isActive: boolean;
}

const AdminCategories = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showSuccess, showError, closeModal } = useModal();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchCategories();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('description', data.description);
      if (data.image) fd.append('image', data.image);
      fd.append('isActive', String(data.isActive));

      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory._id, fd);
      } else {
        await adminAPI.createCategory(fd);
      }

      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
      showSuccess(editingCategory ? 'تم تحديث الفئة بنجاح' : 'تم إنشاء الفئة بنجاح');
    } catch (error) {
      console.error('Error saving category:', error);
      showError('حدث خطأ أثناء حفظ الفئة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    showConfirm(
      `هل أنت متأكد من حذف الفئة "${category.name}"؟`,
      async () => {
        try {
          await adminAPI.deleteCategory(category._id);
          fetchCategories();
          showSuccess('تم حذف الفئة بنجاح');
        } catch (error) {
          console.error('Error deleting category:', error);
          showError('حدث خطأ أثناء حذف الفئة');
        }
      }
    );
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const formFields = [
    {
      name: 'name',
      label: 'اسم الفئة',
      type: 'text' as const,
      placeholder: 'أدخل اسم الفئة',
      required: true
    },
    {
      name: 'description',
      label: 'وصف الفئة',
      type: 'textarea' as const,
      placeholder: 'أدخل وصف الفئة',
      required: true
    },
    {
      name: 'image',
      label: 'صورة الفئة',
      type: 'file' as const,
      required: !editingCategory
    },
    {
      name: 'isActive',
      label: 'فئة نشطة',
      type: 'checkbox' as const
    }
  ];

  const tableColumns = [
    {
      key: 'image',
      label: 'الصورة',
      render: (value: string, item: Category) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#251b43]/20">
          <img
            src={value ? `${FILE_BASE_URL}${value.replace(/^\/uploads\//, '')}` : '/placeholder-product.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )
    },
    {
      key: 'name',
      label: 'اسم الفئة'
    },
    {
      key: 'description',
      label: 'الوصف',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'الحالة',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {value ? 'نشطة' : 'غير نشطة'}
        </span>
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
        { value: 'true', label: 'نشطة' },
        { value: 'false', label: 'غير نشطة' }
      ]
    }
  ];

  const getInitialData = () => {
    if (editingCategory) {
      return {
        name: editingCategory.name,
        description: editingCategory.description,
        isActive: editingCategory.isActive
      };
    }
    return {
      name: '',
      description: '',
      isActive: true
    };
  };

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
              title={editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              subtitle={editingCategory ? 'قم بتعديل بيانات الفئة' : 'أضف فئة جديدة للمتجر'}
              fields={formFields}
              initialData={getInitialData()}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
              isLoading={isSubmitting}
              mode={editingCategory ? 'edit' : 'create'}
            />
          ) : (
            <AdminTable
              title="إدارة الفئات"
              subtitle="أضف، عدّل، واحذف فئات المنتجات"
              columns={tableColumns}
              data={categories}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="البحث في الفئات..."
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

export default AdminCategories;

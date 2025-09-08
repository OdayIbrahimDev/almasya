'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Header from '../../components/layout/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/Auth';
import { adminAPI } from '../../service/api';
import AdminForm from '../../components/ui/AdminForm';
import AdminTable from '../../components/ui/AdminTable';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';

interface Currency {
  _id: string;
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
  isDefault: boolean;
  exchangeRate: number;
  createdAt: string;
}

const AdminCurrency = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showSuccess, showError, closeModal } = useModal();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchCurrencies();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchCurrencies = async () => {
    try {
      const response = await adminAPI.getCurrencies();
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingCurrency) {
        await adminAPI.updateCurrency(editingCurrency._id, {
          name: data.name,
          code: data.code,
          symbol: data.symbol,
          isActive: data.isActive,
          isDefault: data.isDefault,
          exchangeRate: data.exchangeRate
        });
      } else {
        await adminAPI.createCurrency({
          name: data.name,
          code: data.code,
          symbol: data.symbol,
          isActive: data.isActive,
          isDefault: data.isDefault,
          exchangeRate: data.exchangeRate
        });
      }

      setShowForm(false);
      setEditingCurrency(null);
      fetchCurrencies();
      showSuccess(editingCurrency ? 'تم تحديث العملة بنجاح' : 'تم إنشاء العملة بنجاح');
    } catch (error) {
      console.error('Error saving currency:', error);
      showError('حدث خطأ أثناء حفظ العملة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setShowForm(true);
  };

  const handleDelete = async (currency: Currency) => {
    if (currency.isDefault) {
      showError('لا يمكن حذف العملة الافتراضية');
      return;
    }

    showConfirm(
      `هل أنت متأكد من حذف العملة "${currency.name}"؟`,
      async () => {
        try {
          await adminAPI.deleteCurrency(currency._id);
          fetchCurrencies();
          showSuccess('تم حذف العملة بنجاح');
        } catch (error) {
          console.error('Error deleting currency:', error);
          showError('حدث خطأ أثناء حذف العملة');
        }
      }
    );
  };

  const handleAdd = () => {
    setEditingCurrency(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCurrency(null);
  };

  const formFields = [
    {
      name: 'name',
      label: 'اسم العملة',
      type: 'text' as const,
      placeholder: 'مثال: الجنيه المصري',
      required: true
    },
    {
      name: 'code',
      label: 'رمز العملة',
      type: 'text' as const,
      placeholder: 'مثال: EGP',
      required: true,
      validation: (value: string) => {
        if (value.length !== 3) {
          return 'رمز العملة يجب أن يكون 3 أحرف';
        }
        return null;
      }
    },
    {
      name: 'symbol',
      label: 'رمز العملة',
      type: 'text' as const,
      placeholder: 'مثال: د.أ',
      required: true
    },
    {
      name: 'exchangeRate',
      label: 'سعر الصرف',
      type: 'number' as const,
      placeholder: 'مثال: 1.0',
      required: true,
      validation: (value: string) => {
        if (isNaN(Number(value)) || Number(value) <= 0) {
          return 'سعر الصرف يجب أن يكون رقم موجب';
        }
        return null;
      }
    },
    {
      name: 'isActive',
      label: 'عملة نشطة',
      type: 'checkbox' as const
    },
    {
      name: 'isDefault',
      label: 'العملة الافتراضية',
      type: 'checkbox' as const
    }
  ];

  const tableColumns = [
    {
      key: 'name',
      label: 'اسم العملة'
    },
    {
      key: 'code',
      label: 'الرمز',
      render: (value: string) => (
        <span className="font-mono text-sm bg-[#251b43]/20 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'symbol',
      label: 'الرمز'
    },
    {
      key: 'exchangeRate',
      label: 'سعر الصرف',
      render: (value: number) => (
        <span className="font-medium text-white">
          {value.toFixed(4)}
        </span>
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
      key: 'isDefault',
      label: 'افتراضية',
      render: (value: boolean) => (
        value && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[gray-300]/20 text-[gray-300]">
            افتراضية
          </span>
        )
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
    },
    {
      key: 'isDefault',
      label: 'افتراضية',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'افتراضية' },
        { value: 'false', label: 'غير افتراضية' }
      ]
    }
  ];

  const getInitialData = () => {
    if (editingCurrency) {
      return {
        name: editingCurrency.name,
        code: editingCurrency.code,
        symbol: editingCurrency.symbol,
        exchangeRate: editingCurrency.exchangeRate,
        isActive: editingCurrency.isActive,
        isDefault: editingCurrency.isDefault
      };
    }
    return {
      name: '',
      code: '',
      symbol: '',
      exchangeRate: 1.0,
      isActive: true,
      isDefault: false
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
              title={editingCurrency ? 'تعديل العملة' : 'إضافة عملة جديدة'}
              subtitle={editingCurrency ? 'قم بتعديل بيانات العملة' : 'أضف عملة جديدة للنظام'}
              fields={formFields}
              initialData={getInitialData()}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={editingCurrency ? 'تحديث العملة' : 'إضافة العملة'}
              isLoading={isSubmitting}
              mode={editingCurrency ? 'edit' : 'create'}
            />
          ) : (
            <AdminTable
              title="إدارة العملات"
              subtitle="أضف، عدّل، واحذف عملات النظام"
              columns={tableColumns}
              data={currencies}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="البحث في العملات..."
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

export default AdminCurrency;

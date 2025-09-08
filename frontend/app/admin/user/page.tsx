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

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

const AdminUsers = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showSuccess, showError, closeModal } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Only update role and isActive when editing
        await adminAPI.updateUser(editingUser._id, {
          role: data.role,
          isActive: data.isActive
        });
      } else {
        await adminAPI.createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role
        });
      }

      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
      showSuccess(editingUser ? 'تم تحديث المستخدم بنجاح' : 'تم إنشاء المستخدم بنجاح');
    } catch (error) {
      console.error('Error saving user:', error);
      showError('حدث خطأ أثناء حفظ المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    if (user._id === (user as any)?._id) {
      showError('لا يمكنك حذف حسابك الخاص');
      return;
    }

    showConfirm(
      `هل أنت متأكد من حذف المستخدم "${user.name}"؟`,
      async () => {
        try {
          await adminAPI.deleteUser(user._id);
          fetchUsers();
          showSuccess('تم حذف المستخدم بنجاح');
        } catch (error) {
          console.error('Error deleting user:', error);
          showError('حدث خطأ أثناء حذف المستخدم');
        }
      }
    );
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const formFields = [
    ...(editingUser ? [] : [
      {
        name: 'name',
        label: 'اسم المستخدم',
        type: 'text' as const,
        placeholder: 'أدخل اسم المستخدم',
        required: true
      },
      {
        name: 'email',
        label: 'البريد الإلكتروني',
        type: 'email' as const,
        placeholder: 'أدخل البريد الإلكتروني',
        required: true,
        validation: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'البريد الإلكتروني غير صحيح';
          }
          return null;
        }
      },
      {
        name: 'password',
        label: 'كلمة المرور',
        type: 'password' as const,
        placeholder: 'أدخل كلمة المرور',
        required: true,
        validation: (value: string) => {
          if (value.length < 6) {
            return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
          }
          return null;
        }
      }
    ]),
    {
      name: 'role',
      label: 'الدور',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'user', label: 'مستخدم' },
        { value: 'admin', label: 'مدير' }
      ]
    },
    ...(editingUser ? [{
      name: 'isActive',
      label: 'حساب نشط',
      type: 'checkbox' as const
    }] : [])
  ];

  const tableColumns = [
    {
      key: 'name',
      label: 'اسم المستخدم'
    },
    {
      key: 'email',
      label: 'البريد الإلكتروني'
    },
    {
      key: 'role',
      label: 'الدور',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'admin' 
            ? 'bg-[#251b43]/20 text-[gray-300]' 
            : 'bg-[#251b43]/20 text-gray-300'
        }`}>
          {value === 'admin' ? 'مدير' : 'مستخدم'}
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
          {value ? 'نشط' : 'غير نشط'}
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
      key: 'role',
      label: 'الدور',
      type: 'select' as const,
      options: [
        { value: 'user', label: 'مستخدم' },
        { value: 'admin', label: 'مدير' }
      ]
    },
    {
      key: 'isActive',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' }
      ]
    }
  ];

  const getInitialData = () => {
    if (editingUser) {
      return {
        role: editingUser.role,
        isActive: editingUser.isActive
      };
    }
    return {
      name: '',
      email: '',
      password: '',
      role: 'user'
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
              title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
              subtitle={editingUser ? 'قم بتعديل بيانات المستخدم' : 'أضف مستخدم جديد للنظام'}
              fields={formFields}
              initialData={getInitialData()}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitText={editingUser ? 'تحديث المستخدم' : 'إضافة المستخدم'}
              isLoading={isSubmitting}
              mode={editingUser ? 'edit' : 'create'}
            />
          ) : (
            <AdminTable
              title="إدارة المستخدمين"
              subtitle="أضف، عدّل، واحذف مستخدمي النظام"
              columns={tableColumns}
              data={users}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="البحث في المستخدمين..."
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

export default AdminUsers;

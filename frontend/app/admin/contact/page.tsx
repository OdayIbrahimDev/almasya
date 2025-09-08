'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Eye, CheckCircle, MessageCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/Auth';
import { adminAPI } from '../../service/api';
import AdminTable from '../../components/ui/AdminTable';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  phone?: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

const AdminContact = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showInfo, showSuccess, showError, closeModal } = useModal();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchContacts();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchContacts = async () => {
    try {
      console.log('Fetching contacts...');
      const response = await adminAPI.getContacts();
      console.log('Contacts response:', response);
      setContacts(response.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (contact: Contact) => {
    try {
      await adminAPI.markContactAsRead(contact._id);
      showSuccess('تم تحديث حالة الرسالة');
      fetchContacts(); // Refresh the list
    } catch (error) {
      console.error('Error marking contact as read:', error);
      showError('حدث خطأ أثناء تحديث حالة الرسالة');
    }
  };

  const handleMarkAsReplied = async (contact: Contact) => {
    try {
      await adminAPI.markContactAsReplied(contact._id);
      showSuccess('تم تحديث حالة الرسالة');
      fetchContacts(); // Refresh the list
    } catch (error) {
      console.error('Error marking contact as replied:', error);
      showError('حدث خطأ أثناء تحديث حالة الرسالة');
    }
  };

  const handleView = (contact: Contact) => {
    const status = getStatusText(contact.status);
    const createdAt = new Date(contact.createdAt).toLocaleDateString('ar-EG');
    
    showInfo(
      `رسالة من: ${contact.name}\n\nالبريد الإلكتروني: ${contact.email}\nرقم الجوال: ${contact.phone || 'غير محدد'}\nالحالة: ${status}\nالتاريخ: ${createdAt}\n\nالرسالة:\n${contact.message}`,
      'تفاصيل الرسالة'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-[gray-300]/20 text-[gray-300]';
      case 'replied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unread':
        return 'غير مقروءة';
      case 'read':
        return 'مقروءة';
      case 'replied':
        return 'تم الرد';
      default:
        return status;
    }
  };

  const filterOptions = [
    {
      key: 'status',
      label: 'حالة الرسالة',
      type: 'select' as const,
      options: [
        { value: 'unread', label: 'غير مقروءة' },
        { value: 'read', label: 'مقروءة' },
        { value: 'replied', label: 'تم الرد' }
      ]
    },
    {
      key: 'createdAt',
      label: 'تاريخ الرسالة',
      type: 'date' as const
    }
  ];

  const tableColumns = [
    {
      key: 'name',
      label: 'الاسم',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'email',
      label: 'البريد الإلكتروني',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'phone',
      label: 'رقم الجوال',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'غير محدد'}</span>
      )
    },
    {
      key: 'message',
      label: 'الرسالة',
      render: (value: string) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={value}>
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </div>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (value: string, item: Contact) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {getStatusText(value)}
          </span>
          
          {value === 'unread' && (
            <button
              onClick={() => handleMarkAsRead(item)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="تحديد كمقروءة"
            >
              <CheckCircle size={14} />
            </button>
          )}
          
          {value === 'read' && (
            <button
              onClick={() => handleMarkAsReplied(item)}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              title="تحديد كرد عليها"
            >
              <MessageCircle size={14} />
            </button>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'تاريخ الرسالة',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('ar-EG')}
        </span>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الرسائل...</p>
          </div>
        </div>
      </div>
    );
  }

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
            title="رسائل التواصل"
            subtitle="عرض وإدارة رسائل العملاء"
            columns={tableColumns}
            data={contacts}
            onView={handleView}
            searchPlaceholder="البحث في الرسائل..."
            isLoading={isLoading}
            filters={filterOptions}
          />
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

export default AdminContact;

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Users, Send, Eye } from 'lucide-react';
import Header from '../../components/layout/Header';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/Auth';
import { adminAPI } from '../../service/api';
import Modal from '../../components/ui/Modal';
import { useModal } from '../../hooks/useModal';
import Link from 'next/link';

interface Subscriber {
  _id: string;
  email: string;
  createdAt: string;
}

const AdminNewsletter = () => {
  const { user, isAuthenticated } = useAuth();
  const { modalState, showConfirm, showInfo, showSuccess, showError, closeModal } = useModal();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchSubscribers();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchSubscribers = async () => {
    try {
      const response = await adminAPI.getNewsletterSubscribers();
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterForm.subject.trim() || !newsletterForm.content.trim()) {
      showError('يرجى إدخال الموضوع والمحتوى');
      return;
    }

    showConfirm(
      `هل تريد إرسال النشرة الإخبارية إلى ${subscribers.length} مشترك؟`,
      async () => {
        try {
          setIsSending(true);
          const response = await adminAPI.sendNewsletter({
            subject: newsletterForm.subject,
            html: newsletterForm.content
          });
          
          showSuccess(`تم إرسال النشرة الإخبارية بنجاح إلى ${response.data.count} مشترك`);
          setNewsletterForm({ subject: '', content: '' });
        } catch (error) {
          console.error('Error sending newsletter:', error);
          showError('حدث خطأ أثناء إرسال النشرة الإخبارية');
        } finally {
          setIsSending(false);
        }
      }
    );
  };

  const getNewsletterPreview = () => {
    return `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #a075ad 0%, #8b6a9a 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📧 ${newsletterForm.subject}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">متجرنا - مشغولات يدوية أصيلة</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <div style="color: #2d3748; font-size: 16px; line-height: 1.8;">
            ${newsletterForm.content.replace(/\n/g, '<br>')}
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #a075ad, #8b6a9a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              شاهد منتجاتنا الجديدة
            </a>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f7fafc; border-radius: 12px;">
            <h3 style="color: #2d3748; margin-bottom: 15px;">تابعنا للحصول على آخر التحديثات</h3>
            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 15px;">
              <a href="#" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #a075ad, #8b6a9a); border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none;">📘</a>
              <a href="#" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #a075ad, #8b6a9a); border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none;">📷</a>
              <a href="#" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #a075ad, #8b6a9a); border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none;">🎵</a>
              <a href="#" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #a075ad, #8b6a9a); border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none;">💬</a>
            </div>
          </div>
        </div>
        
        <div style="background-color: #2d3748; color: white; padding: 30px; text-align: center;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>متجرنا</strong></p>
          <p style="margin: 5px 0; font-size: 14px;">مشغولات يدوية وكروشيه أصيلة منذ 2019</p>
          <p style="margin: 5px 0; font-size: 14px;">📍 القاهرة، مصر | 🌍 نشحن لكل الدول</p>
        </div>
      </div>
    `;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المشتركين...</p>
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
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/admin" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              العودة للوحة التحكم
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Newsletter Form */}
            <div className="bg-[#251b43] rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#211c31] to-[gray-300] rounded-lg flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">إرسال نشرة إخبارية</h2>
                  <p className="text-gray-300">إنشاء وإرسال نشرة إخبارية للمشتركين</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSendNewsletter(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    موضوع النشرة الإخبارية
                  </label>
                  <input
                    type="text"
                    value={newsletterForm.subject}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#211c31] focus:border-transparent bg-[#251b43] text-white"
                    placeholder="أدخل موضوع النشرة الإخبارية"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    محتوى النشرة الإخبارية
                  </label>
                  <textarea
                    value={newsletterForm.content}
                    onChange={(e) => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#211c31] focus:border-transparent bg-[#251b43] text-white"
                    placeholder="أدخل محتوى النشرة الإخبارية..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSending || !newsletterForm.subject.trim() || !newsletterForm.content.trim()}
                    className="flex-1 bg-gradient-to-r from-[#211c31] to-[gray-300] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#251b43] hover:to-[#c0a47e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        إرسال النشرة الإخبارية
                      </>
                    )}
                  </button>
                  
                  {newsletterForm.subject.trim() && newsletterForm.content.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const preview = getNewsletterPreview();
                        showInfo(preview, 'معاينة النشرة الإخبارية');
                      }}
                      className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-[#251b43] transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      معاينة
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Subscribers List */}
            <div className="bg-[#251b43] rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[gray-300] to-[#c0a47e] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">قائمة المشتركين</h2>
                  <p className="text-gray-300">{subscribers.length} مشترك</p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {subscribers.map((subscriber) => (
                  <motion.div
                    key={subscriber._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-[#251b43] rounded-lg hover:bg-[#251b43] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#211c31] to-[gray-300] rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{subscriber.email}</p>
                        <p className="text-sm text-gray-400">
                          انضم في {new Date(subscriber.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {subscribers.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">لا يوجد مشتركين بعد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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

export default AdminNewsletter;
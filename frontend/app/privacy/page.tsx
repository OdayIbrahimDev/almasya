'use client';

import Header from '../components/layout/Header';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-right">سياسة الخصوصية</h1>
        <p className="text-gray-600 mb-6 text-right">
          نحرص على حماية خصوصية بياناتك. توضح هذه الصفحة كيفية جمع
          المعلومات واستخدامها وحمايتها.
        </p>
        <div className="space-y-6 text-right">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">المعلومات التي نجمعها</h2>
            <p className="text-gray-600">نقوم بجمع معلومات الحساب والطلبات لتحسين تجربتك.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">كيفية استخدام المعلومات</h2>
            <p className="text-gray-600">نستخدم بياناتك لمعالجة الطلبات، والدعم، وإرسال التحديثات.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">حماية البيانات</h2>
            <p className="text-gray-600">نطبق إجراءات أمان لحماية بياناتك من الوصول غير المصرح به.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">تواصل معنا</h2>
            <p className="text-gray-600">للاستفسارات حول الخصوصية، تواصل عبر البريد info@example.com</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;



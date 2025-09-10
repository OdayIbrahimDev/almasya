"use client";

import { useState } from 'react';
import Header from '../../components/layout/Header';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import api from '../../service/api';
import { colorClasses } from '../../utils/colors';
import { useRouter } from 'next/navigation';

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const router = useRouter();

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			setMessage(null);
			const res = await api.post('/auth/forgot-password', { email });
			
			if (res.data?.success) {
				setMessage('تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني');
				setEmailSent(true);
				// Redirect to reset password page after 2 seconds
				setTimeout(() => {
					router.push(`/resetPassword?email=${encodeURIComponent(email)}`);
				}, 2000);
			} else {
				setMessage(res.data?.message || 'تم إرسال رمز إعادة التعيين إن وجد الحساب');
				setEmailSent(true);
				// Redirect to reset password page after 2 seconds
				setTimeout(() => {
					router.push(`/resetPassword?email=${encodeURIComponent(email)}`);
				}, 2000);
			}
		} catch (e: unknown) {
			const error = e as { response?: { status?: number; data?: { message?: string } } };
			if (error?.response?.status === 404) {
				setMessage('البريد الإلكتروني غير مسجل في النظام');
			} else {
				setMessage(error?.response?.data?.message || 'خطأ في الطلب');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#251b43]">
			<Header />
			<main className="flex items-center justify-center min-h-screen px-4 py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="w-full max-w-md"
				>
					<div className="bg-[#251b43] rounded-3xl shadow-2xl border border-gray-600 p-8">
						<div className="text-center mb-8">
							<h1 className="text-3xl font-bold text-white mb-2">نسيت كلمة المرور</h1>
							<p className="text-gray-300">أدخل بريدك الإلكتروني للحصول على رمز إعادة التعيين</p>
						</div>

						{!emailSent ? (
							<form onSubmit={submit} className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2 text-right">
										البريد الإلكتروني
									</label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
										<input
											type="email"
											required
											placeholder="أدخل بريدك الإلكتروني"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-[#211c31] focus:border-transparent text-right transition-all placeholder:text-gray-400 placeholder:opacity-100 bg-[#251b43] text-white"
										/>
									</div>
								</div>

								<button
									disabled={loading}
									type="submit"
									className="w-full bg-[#251b43] text-white py-4 rounded-xl font-semibold hover:bg-[#251b43] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<motion.div
												animate={{ rotate: 360 }}
												transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
												className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
											/>
											جاري الإرسال...
										</div>
									) : (
										'إرسال رمز إعادة التعيين'
									)}
								</button>
							</form>
						) : (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-center space-y-6"
							>
								<div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
									<Mail className="text-green-400" size={32} />
								</div>
								<div>
									<h3 className="text-xl font-semibold text-white mb-2">تم إرسال الرمز</h3>
									<p className="text-gray-300">
										تم إرسال رمز إعادة التعيين المكون من 6 أرقام إلى بريدك الإلكتروني
									</p>
									<p className="text-sm text-gray-400 mt-2">
										سيتم توجيهك إلى صفحة إعادة تعيين كلمة المرور خلال ثانيتين...
									</p>
								</div>
								<button
									onClick={() => {
										setEmailSent(false);
										setMessage(null);
									}}
									className="w-full bg-[#251b43] text-white py-3 rounded-xl font-semibold hover:bg-[#251b43] transition-colors"
								>
									إرسال رمز آخر
								</button>
							</motion.div>
						)}

						{message && !emailSent && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className={`mt-6 p-4 rounded-xl text-right ${
									message.includes('تم إرسال') 
										? 'bg-green-500/20 border border-green-500/50 text-green-400'
										: 'bg-red-500/20 border border-red-500/50 text-red-400'
								}`}
							>
								{message}
							</motion.div>
						)}

						<div className="mt-8 pt-6 border-t border-gray-600 text-center">
							<p className="text-gray-300">
								تذكرت كلمة المرور؟{' '}
								<a href="/login" className="text-[#211c31] hover:text-[#251b43] font-semibold transition-colors">
									تسجيل الدخول
								</a>
							</p>
						</div>
					</div>
				</motion.div>
			</main>
		</div>
	);
};

export default ForgotPasswordPage;



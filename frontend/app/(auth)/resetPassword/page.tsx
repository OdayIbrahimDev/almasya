"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import Header from '../../components/layout/Header';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, Lock } from 'lucide-react';
import api from '../../service/api';
import { colorClasses } from '../../utils/colors';
import { useRouter, useSearchParams } from 'next/navigation';

const ResetPasswordForm = () => {
	const [code, setCode] = useState(['', '', '', '', '', '']);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState('');
	const router = useRouter();
	const searchParams = useSearchParams();
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		const emailParam = searchParams.get('email');
		if (emailParam) {
			setEmail(emailParam);
		}
	}, [searchParams]);

	const handleCodeChange = (index: number, value: string) => {
		// Only allow numeric input
		value = value.replace(/\D/g, '');
		
		if (value.length > 1) {
			value = value.slice(-1); // Take only the last character
		}
		
		const newCode = [...code];
		newCode[index] = value;
		setCode(newCode);

		// Auto-focus next input (for RTL, we go to the right)
		if (value && index < 5) {
			setTimeout(() => {
				inputRefs.current[index + 1]?.focus();
			}, 0);
		}
	};

	const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			if (!code[index] && index > 0) {
				// Move to previous input on backspace if current is empty
				inputRefs.current[index - 1]?.focus();
			} else if (code[index]) {
				// Clear current input if it has value
				const newCode = [...code];
				newCode[index] = '';
				setCode(newCode);
			}
		}
		// Handle arrow keys for RTL navigation
		if (e.key === 'ArrowLeft' && index < 5) {
			e.preventDefault();
			inputRefs.current[index + 1]?.focus();
		}
		if (e.key === 'ArrowRight' && index > 0) {
			e.preventDefault();
			inputRefs.current[index - 1]?.focus();
		}
		// Handle Delete key
		if (e.key === 'Delete') {
			const newCode = [...code];
			newCode[index] = '';
			setCode(newCode);
		}
	};

	const handleCodePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
		const newCode = [...code];
		
		for (let i = 0; i < 6; i++) {
			newCode[i] = pastedData[i] || '';
		}
		
		setCode(newCode);
		
		// Focus the next empty input or the last one
		const nextEmptyIndex = newCode.findIndex(char => !char);
		const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
		setTimeout(() => {
			inputRefs.current[focusIndex]?.focus();
		}, 0);
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		const codeString = code.join('');
		if (codeString.length !== 6) {
			setMessage('الرجاء إدخال الرمز المكون من 6 أرقام');
			return;
		}
		
		if (password !== confirmPassword) {
			setMessage('كلمات المرور غير متطابقة');
			return;
		}

		if (password.length < 6) {
			setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
			return;
		}

		try {
			setLoading(true);
			setMessage(null);
			// Use the code as the token (in real app, you'd validate the code first)
			const res = await api.post('/auth/reset-password', { token: codeString, password });
			setMessage(res.data?.message || 'تمت إعادة تعيين كلمة المرور بنجاح');
			// Clear form on success
			setCode(['', '', '', '', '', '']);
			setPassword('');
			setConfirmPassword('');
			// Redirect to login page after 3 seconds
			setTimeout(() => {
				router.push('/login');
			}, 3000);
		} catch (error: unknown) {
			const e = error as { response?: { data?: { message?: string } } };
			setMessage(e?.response?.data?.message || 'خطأ في إعادة تعيين كلمة المرور');
		} finally {
			setLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="w-full max-w-md"
		>
			<div className="bg-[#251b43] rounded-3xl shadow-2xl border border-gray-600 p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">إعادة تعيين كلمة المرور</h1>
					<p className="text-gray-300">أدخل رمز إعادة التعيين وكلمة المرور الجديدة</p>
					{email && (
						<p className="text-sm text-gray-400 mt-2">للبريد الإلكتروني: {email}</p>
					)}
				</div>

				<form onSubmit={submit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2 text-right">
							رمز إعادة التعيين
						</label>
						<div className="flex justify-center gap-2" dir="ltr">
							{code.map((digit, index) => (
								<input
									key={index}
									ref={(el) => {
										inputRefs.current[index] = el;
									}}
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									maxLength={1}
									value={digit}
									onChange={(e) => handleCodeChange(index, e.target.value)}
									onKeyDown={(e) => handleCodeKeyDown(index, e)}
									onPaste={handleCodePaste}
									className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-[#211c31] focus:border-transparent transition-all bg-[#251b43] text-white"
									placeholder=""
									dir="ltr"
								/>
							))}
						</div>
						<p className="text-xs text-gray-400 mt-2 text-center">
							يمكنك لصق الرمز مباشرة أو كتابته رقم برقم
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2 text-right">
							كلمة المرور الجديدة
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
							<input
								type={showPassword ? 'text' : 'password'}
								required
								placeholder="أدخل كلمة المرور الجديدة"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full pl-12 pr-12 py-4 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-[#211c31] focus:border-transparent text-right transition-all placeholder:text-gray-400 placeholder:opacity-100 bg-[#251b43] text-white"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2 text-right">
							تأكيد كلمة المرور
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								required
								placeholder="أعد إدخال كلمة المرور الجديدة"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full pl-12 pr-12 py-4 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-[#211c31] focus:border-transparent text-right transition-all placeholder:text-gray-400 placeholder:opacity-100 bg-[#251b43] text-white"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
							>
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					{message && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className={`px-4 py-3 rounded-xl text-right ${
								message.includes('نجاح') 
									? 'bg-green-500/20 border border-green-500/50 text-green-400'
									: 'bg-red-500/20 border border-red-500/50 text-red-400'
							}`}
						>
							{message}
							{message.includes('نجاح') && (
								<p className="text-sm mt-2 text-gray-300">سيتم توجيهك إلى صفحة تسجيل الدخول خلال 3 ثوان...</p>
							)}
						</motion.div>
					)}

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
								جاري إعادة التعيين...
							</div>
						) : (
							'إعادة تعيين كلمة المرور'
						)}
					</button>
				</form>

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
	);
};

const ResetPasswordPage = () => {
	return (
		<div className="min-h-screen bg-[#251b43]">
			<Header />
			<main className="flex items-center justify-center min-h-screen px-4 py-20">
				<Suspense fallback={
					<div className="w-full max-w-md">
						<div className="bg-[#251b43] rounded-3xl shadow-2xl border border-gray-600 p-8">
							<div className="text-center mb-8">
								<h1 className="text-3xl font-bold text-white mb-2">إعادة تعيين كلمة المرور</h1>
								<p className="text-gray-300">جاري التحميل...</p>
							</div>
						</div>
					</div>
				}>
					<ResetPasswordForm />
				</Suspense>
			</main>
		</div>
	);
};

export default ResetPasswordPage;


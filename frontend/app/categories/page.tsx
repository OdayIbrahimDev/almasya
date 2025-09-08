"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRight, Star, ShoppingBag, Heart } from 'lucide-react';
import Header from '../components/layout/Header';
import { productsAPI, FILE_BASE_URL } from '../service/api';

interface Category {
	_id: string;
	name: string;
	isActive?: boolean;
	image?: string;
}

const CategoriesPage: React.FC = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const res = await productsAPI.getCategories();
				setCategories(res.data || []);
			} catch (e: unknown) {
				console.error('Error fetching categories:', e);
				setError('تعذر جلب الفئات الآن');
			} finally {
				setIsLoading(false);
			}
		};
		fetchCategories();
	}, []);

	const resolveImageUrl = (img?: string) => {
		if (!img) return '/placeholder-product.jpg';
		if (img.startsWith('http')) return img;
		return `${FILE_BASE_URL}${img.replace(/^\/uploads\//, '')}`;
	  };
	

	return (
		<div className="min-h-screen">
			<Header />
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#251b43]/10">
				{/* Hero Section */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center mb-16"
				>
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#211c31] to-gray-300 rounded-2xl mb-6">
						<Package size={40} className="text-white" />
					</div>
					<h1 className="text-5xl md:text-6xl font-bold text-white mb-6">فئات المنتجات</h1>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
						اكتشف مجموعاتنا المميزة والمتنوعة، كل فئة مصممة بعناية لتناسب مختلف الأذواق والأنماط
					</p>
				</motion.div>

				{isLoading ? (
					<div className="flex justify-center items-center py-20">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
							className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full"
						/>
					</div>
				) : error ? (
					<div className="text-center text-red-400 bg-red-500/20 p-6 rounded-2xl max-w-md mx-auto">{error}</div>
				) : (
					<div className="space-y-12">
						<AnimatePresence>
							{categories.map((category, index) => (
								<motion.div
									key={category._id}
									initial={{ opacity: 0, y: 40 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.8, delay: index * 0.2 }}
									className="group"
								>
									<Link href={{ pathname: '/products', query: { category: category._id } }} className="block">
										<div className="bg-[#251b43]/80 backdrop-blur supports-[backdrop-filter]:bg-[#251b43]/80 rounded-3xl p-8 shadow-2xl border border-gray-600/40 hover:shadow-3xl transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
												{/* Image Section */}
												<div className="relative overflow-hidden rounded-2xl">
													<div className="h-80 lg:h-96 bg-gradient-to-br from-purple-100 to-blue-100">
														<img
															src={resolveImageUrl(category.image)}
															alt={category.name}
															className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
														/>
													</div>
													<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
													<div className="absolute bottom-4 right-4 bg-gray-300 text-[#211c31] px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
														تصفح الفئة
													</div>
												</div>

												{/* Content Section */}
												<div className="text-right space-y-6">
													<div>
														<h2 className="text-4xl font-bold text-white mb-4 group-hover:text-gray-300 transition-colors duration-300">
															{category.name}
														</h2>
														<p className="text-lg text-gray-300 leading-relaxed">
															اكتشف مجموعة متنوعة ومميزة من المنتجات عالية الجودة في هذه الفئة. 
															نقدم لك أفضل الخيارات التي تناسب احتياجاتك وتوقعاتك.
														</p>
													</div>

													{/* Features */}
													<div className="grid grid-cols-2 gap-4">
														<div className="flex items-center space-x-3 space-x-reverse text-gray-300">
															<div className="w-10 h-10 bg-gray-300/20 rounded-full flex items-center justify-center">
																<Star size={20} className="text-gray-300" />
															</div>
															<span className="font-medium">جودة عالية</span>
														</div>
														<div className="flex items-center space-x-3 space-x-reverse text-gray-300">
															<div className="w-10 h-10 bg-gray-300/20 rounded-full flex items-center justify-center">
																<ShoppingBag size={20} className="text-gray-300" />
															</div>
															<span className="font-medium">تشكيلة واسعة</span>
														</div>
														<div className="flex items-center space-x-3 space-x-reverse text-gray-300">
															<div className="w-10 h-10 bg-gray-300/20 rounded-full flex items-center justify-center">
																<Heart size={20} className="text-gray-300" />
															</div>
															<span className="font-medium">تصميم مميز</span>
														</div>
														<div className="flex items-center space-x-3 space-x-reverse text-gray-300">
															<div className="w-10 h-10 bg-gray-300/20 rounded-full flex items-center justify-center">
																<Package size={20} className="text-gray-300" />
															</div>
															<span className="font-medium">شحن سريع</span>
														</div>
													</div>

													{/* CTA Button */}
													<div className="pt-4">
														<div className="inline-flex items-center bg-gray-300 text-[#211c31] px-8 py-4 rounded-2xl font-semibold group-hover:bg-gray-400 transition-all duration-300 shadow-lg group-hover:shadow-xl">
															<span>استكشف المنتجات</span>
															<ArrowRight size={20} className="mr-3 transform group-hover:translate-x-1 transition-transform duration-300" />
														</div>
													</div>
												</div>
											</div>
										</div>
									</Link>
								</motion.div>
							))}
						</AnimatePresence>

						{/* Bottom CTA */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8, duration: 0.8 }}
							className="text-center pt-8"
						>
							<div className="bg-[#251b43]/80 backdrop-blur supports-[backdrop-filter]:bg-[#251b43]/80 rounded-3xl p-12 shadow-2xl border border-gray-600/40">
								<h3 className="text-3xl font-bold text-white mb-4">لم تجد ما تبحث عنه؟</h3>
								<p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
									تصفح جميع منتجاتنا أو تواصل معنا لمساعدتك في العثور على ما تحتاجه
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link href="/products">
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className="bg-gray-300 text-[#211c31] px-8 py-4 rounded-2xl font-semibold hover:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
										>
											تصفح جميع المنتجات
										</motion.button>
									</Link>
									<Link href="/">
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className="bg-[#251b43] text-gray-300 px-8 py-4 rounded-2xl font-semibold hover:bg-[#251b43] transition-all duration-200"
										>
											العودة للرئيسية
										</motion.button>
									</Link>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</main>
		</div>
	);
};

export default CategoriesPage;

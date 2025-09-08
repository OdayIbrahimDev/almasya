'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import { productsAPI } from '../service/api';
import ProductCard from '../components/ui/ProductCard';
import { colorClasses } from '../utils/colors';

interface Product {
	_id: string;
	name: string;
	description: string;
	price: number;
	offerPrice?: number;
	image?: string;
	category?: { _id: string; name: string } | null;
	currency?: { symbol: string; code: string } | null;
	averageRating?: number;
	totalReviews?: number;
}

interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

const ProductsPage = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [search, setSearch] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [activeCurrencySymbol, setActiveCurrencySymbol] = useState('د.أ');
	const [initialQuery, setInitialQuery] = useState<{search?: string; category?: string}>({});
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationInfo | null>(null);
	const [isLoadingPage, setIsLoadingPage] = useState(false);

	useEffect(() => {
		// Pick up search/category from header query params
		const params = new URLSearchParams(window.location.search);
		const s = params.get('search') || '';
		const c = params.get('category') || '';
		if (s) setSearch(s);
		setInitialQuery({ search: s || undefined, category: c || undefined });
		
		// Reset to page 1 when search/category changes
		setCurrentPage(1);
	}, []);

	useEffect(() => {
		fetchProducts();
	}, [currentPage, search, initialQuery]);

	const fetchProducts = async () => {
		try {
			setIsLoadingPage(true);
			const [res, currencyRes] = await Promise.all([
				productsAPI.getAll({
					...initialQuery,
					search: search || undefined,
					page: currentPage,
					limit: 12
				}),
				productsAPI.getActiveCurrency()
			]);
			
			setProducts(res.data.data || []);
			setPagination(res.data.pagination);
			// Always use د.أ as the default currency symbol
			setActiveCurrencySymbol('د.أ');
		} catch (e) {
			console.error('Error loading products:', e);
		} finally {
			setIsLoading(false);
			setIsLoadingPage(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
		// Scroll to top when page changes
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const formatPrice = (price: number) => `${(price || 0).toLocaleString('EGP')} ${activeCurrencySymbol}`;

	return (
		<div className="min-h-screen">
			<Header />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">المنتجات</h1>
					<p className="text-gray-300">
						تصفح جميع منتجاتنا
						{pagination && (
							<span className="text-sm text-gray-400 mr-2">
								({pagination.totalItems} منتج)
							</span>
						)}
					</p>
				</motion.div>

				{isLoading ? (
					<div className="text-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto" />
						<p className="mt-4 text-gray-300">جاري تحميل المنتجات...</p>
					</div>
				) : (
					<>
						{/* Products Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-[#251b43] p-4">
							<AnimatePresence mode="wait">
								{isLoadingPage ? (
									// Loading skeleton
									Array.from({ length: 12 }).map((_, index) => (
										<motion.div
											key={index}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="bg-[#251b43] rounded-xl shadow-lg p-6 animate-pulse"
										>
											<div className="bg-gray-600 h-48 rounded-lg mb-4"></div>
											<div className="bg-gray-600 h-4 rounded mb-2"></div>
											<div className="bg-gray-600 h-4 rounded w-3/4 mb-2"></div>
											<div className="bg-gray-600 h-6 rounded w-1/2"></div>
										</motion.div>
									))
								) : (
									products.map((product) => (
										<ProductCard key={product._id} product={product} currencySymbol={activeCurrencySymbol} />
									))
								)}
							</AnimatePresence>
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<motion.div 
								initial={{ opacity: 0, y: 20 }} 
								animate={{ opacity: 1, y: 0 }} 
								className="flex justify-center items-center space-x-4 space-x-reverse"
							>
								{/* Previous Page */}
								<button
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={!pagination.hasPrevPage}
									className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 ${
										pagination.hasPrevPage
											? 'bg-[#251b43] hover:bg-[#251b43] text-gray-300 shadow-md hover:shadow-lg'
											: 'bg-[#251b43] text-gray-500 cursor-not-allowed'
									}`}
								>
									<ChevronRight size={20} />
									<span>السابق</span>
								</button>

								{/* Page Numbers */}
								<div className="flex items-center space-x-2 space-x-reverse">
									{Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
										let pageNum;
										if (pagination.totalPages <= 5) {
											pageNum = i + 1;
										} else if (currentPage <= 3) {
											pageNum = i + 1;
										} else if (currentPage >= pagination.totalPages - 2) {
											pageNum = pagination.totalPages - 4 + i;
										} else {
											pageNum = currentPage - 2 + i;
										}

										return (
											<button
												key={pageNum}
												onClick={() => handlePageChange(pageNum)}
												className={`w-10 h-10 rounded-lg transition-all duration-200 ${
																				currentPage === pageNum
								? 'bg-gray-300 text-[#211c31] shadow-lg'
								: 'bg-[#251b43] hover:bg-[#251b43] text-gray-300 shadow-md hover:shadow-lg'
												}`}
											>
												{pageNum}
											</button>
										);
									})}
								</div>

								{/* Next Page */}
								<button
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={!pagination.hasNextPage}
									className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 ${
										pagination.hasNextPage
											? 'bg-[#251b43] hover:bg-[#251b43] text-gray-300 shadow-md hover:shadow-lg'
											: 'bg-[#251b43] text-gray-500 cursor-not-allowed'
									}`}
								>
									<span>التالي</span>
									<ChevronLeft size={20} />
								</button>
							</motion.div>
						)}

						{/* Page Info */}
						{pagination && (
							<motion.div 
								initial={{ opacity: 0 }} 
								animate={{ opacity: 1 }} 
								className="text-center mt-6 text-sm text-gray-400"
							>
								صفحة {pagination.currentPage} من {pagination.totalPages} 
								<span className="mx-2">•</span>
								{pagination.totalItems} منتج إجمالي
							</motion.div>
						)}
					</>
				)}
			</main>
		</div>
	);
};

export default ProductsPage;

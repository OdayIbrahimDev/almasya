"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';

const AboutPage: React.FC = () => {
	return (
		<div className="min-h-screen">
			<Header />
			<main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-10"
				>
					<h1 className="text-3xl md:text-5xl font-bold text-white">من نحن</h1>
					<p className="text-gray-300 mt-3 max-w-2xl mx-auto">
						Almasya | ألماسيا للمجوهرات الإماراتية اليدوية
					</p>
					<p className="text-gray-300 mt-4 max-w-4xl mx-auto text-lg leading-relaxed">
						منذ 2019، نصنع مجوهرات إماراتية يدوية فاخرة بتصاميم أصيلة. بدأنا من الإمارات، وتجاوزنا التحديات لنواصل رحلتنا إلى العالم. منتجاتنا الأبرز هي الخواتم والسلاسل الإماراتية بتصاميم خاصة ومميزة، وصلت لأكثر من 5 دول.
					</p>
					<p className="text-gray-300 mt-4 max-w-4xl mx-auto text-lg leading-relaxed">
						نحن ما بس براند مجوهرات، نحن مساحة للإبداع والتجديد من الخواتم والسلاسل لحدي الإكسسوارات المتفردة. رسالتنا إننا نحافظ على روح الهوية الإماراتية ونقدّمها للعالم بشكل أنيق ومعاصر.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
					<div className="bg-[#251b43]/70 backdrop-blur rounded-2xl p-6 shadow border border-gray-600/50">
						<h3 className="text-xl font-semibold text-white mb-2">منتجاتنا</h3>
						<p className="text-gray-300">خواتم ذهبية وفضية، سلاسل إماراتية أصيلة، إكسسوارات يدوية فاخرة، ومجوهرات مخصصة</p>
					</div>
					<div className="bg-[#251b43]/70 backdrop-blur rounded-2xl p-6 shadow border border-gray-600/50">
						<h3 className="text-xl font-semibold text-white mb-2">خدماتنا</h3>
						<p className="text-gray-300">نشتغل بالجملة وبالقطعة للمحلات وللأفراد، ونشحن لكل الدول</p>
					</div>
					<div className="bg-[#251b43]/70 backdrop-blur rounded-2xl p-6 shadow border border-gray-600/50">
						<h3 className="text-xl font-semibold text-white mb-2">موقعنا</h3>
						<p className="text-gray-300">نعمل حالياً من الإمارات، بدأنا من دبي ووصلنا لأكثر من 5 دول</p>
					</div>
				</div>

				{/* Social Media Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="bg-[#251b43]/70 backdrop-blur rounded-2xl p-8 shadow border border-gray-600/50 text-center"
				>
					<h3 className="text-2xl font-semibold text-white mb-4">تواصل معنا</h3>
					<p className="text-gray-300 mb-6">تابعنا على مواقع التواصل الاجتماعي</p>
					<div className="flex flex-wrap justify-center gap-4">
						<a href="https://www.facebook.com/share/1BjfTqEJjH/" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
							فيسبوك
						</a>
						<a href="https://www.instagram.com/almasya_jewelry?igsh=MWl2MDYzeWJsd2t6dQ==" target="_blank" rel="noopener noreferrer" className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors">
							انستغرام
						</a>
						<a href="https://www.tiktok.com/@almasya_jewelry?_t=ZS-8x93h7CeNW5&_r=1" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
							تيك توك
						</a>
						<a href="https://wa.me/message/GAYCPDLPDHLSH1" target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
							واتساب
						</a>
					</div>
				</motion.div>
			</main>
		</div>
	);
};

export default AboutPage;



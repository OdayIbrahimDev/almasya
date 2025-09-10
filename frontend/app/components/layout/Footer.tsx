'use client';

import Link from 'next/link';
import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Heart, Sparkles, Star, Zap, Shield, Truck, Award, Crown, Gem, Sparkle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { newsletterAPI } from '../../service/api';

const Footer = () => {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubscribe = async () => {
    setMessage(null);
    const trimmed = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValid) {
      setMessage("الرجاء إدخال بريد إلكتروني صالح");
      return;
    }
    try {
      setSubmitting(true);
      await newsletterAPI.subscribe(trimmed);
      setMessage("تم الاشتراك بنجاح");
      setEmail("");
    } catch {
      setMessage("حدث خطأ، حاول مرة أخرى لاحقًا");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <footer className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#251b43] via-[#211c31] to-[#1c1a24]"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { left: 57.3, top: 62.0 },
          { left: 98.1, top: 95.5 },
          { left: 44.7, top: 52.2 },
          { left: 13.3, top: 40.2 },
          { left: 70.3, top: 29.3 },
          { left: 0.3, top: 86.5 },
          { left: 31.2, top: 1.6 },
          { left: 81.4, top: 73.7 },
          { left: 62.2, top: 8.4 },
          { left: 53.0, top: 90.7 },
          { left: 49.8, top: 7.2 },
          { left: 69.1, top: 30.7 },
          { left: 57.6, top: 92.3 },
          { left: 29.7, top: 43.8 },
          { left: 13.7, top: 97.7 }
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trust Badges Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { icon: Truck, text: "شحن مجاني", subtext: "لجميع الطلبات" },
            { icon: Shield, text: "ضمان الجودة", subtext: "100% أصلي" },
            { icon: Zap, text: "توصيل سريع", subtext: "خلال 24 ساعة" },
            { icon: Crown, text: "خدمة ممتازة", subtext: "دعم 24/7" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-gray-300/20 to-gray-300/10 rounded-full flex items-center justify-center border border-gray-300/20">
                <item.icon className="w-6 h-6 text-gray-300" />
              </div>
              <h4 className="text-white font-semibold mb-1">{item.text}</h4>
              <p className="text-white/60 text-sm">{item.subtext}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="text-center lg:text-right">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block mb-4"
              >
                <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  Almasya
                </h3>
                <div className="flex items-center justify-center lg:justify-start mt-2">
                  <Gem className="w-4 h-4 text-gray-300 mr-2" />
                  <span className="text-sm text-white/60">مجوهرات إماراتية يدوية</span>
                </div>
              </motion.div>
              <p className="text-white/80 mb-6 leading-relaxed">
                خواتم، سلاسل، وإكسسوارات إماراتية يدوية مصنوعة خصيصاً لك أو جاهزة. نشتغل بالجملة وبالقطعة ونشحن لكل الدول.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex justify-center lg:justify-start space-x-3 space-x-reverse">
                <motion.a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-300/20 to-gray-300/10 border border-gray-300/30 text-white hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
                >
                  <Facebook size={18} className="group-hover:scale-110 transition-transform duration-300 text-gray-300" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                <motion.a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-300/20 to-gray-300/10 border border-gray-300/30 text-white hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
                >
                  <Instagram size={18} className="group-hover:scale-110 transition-transform duration-300 text-gray-300" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                <motion.a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-300/20 to-gray-300/10 border border-gray-300/30 text-white hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                <motion.a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-300/20 to-gray-300/10 border border-gray-300/30 text-white hover:from-gray-300 hover:to-gray-400 transition-all duration-300"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center lg:text-right"
          >
            <h4 className="text-lg font-semibold text-white mb-4">روابط سريعة</h4>
            <nav className="space-y-3">
              <Link href="/" className="block text-white/80 hover:text-white transition-colors">
                الرئيسية
              </Link>
              <Link href="/best-sellers" className="block text-white/80 hover:text-white transition-colors">
                الأكثر مبيعاً
              </Link>
              <Link href="/products" className="block text-white/80 hover:text-white transition-colors">
                المنتجات
              </Link>
              <Link href="/categories" className="block text-white/80 hover:text-white transition-colors">
                الفئات
              </Link>
              <Link href="/about" className="block text-white/80 hover:text-white transition-colors">
                من نحن
              </Link>
              <Link href="/contact" className="block text-white/80 hover:text-white transition-colors">
                اتصل بنا
              </Link>
            </nav>
          </motion.div>

          {/* Customer Service */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-right"
          >
            <h4 className="text-lg font-semibold text-white mb-4">خدمة العملاء</h4>
            <nav className="space-y-3">
              <Link href="/orders" className="block text-white/80 hover:text-white transition-colors">
                طلباتي
              </Link>
              <Link href="/wishlist" className="block text-white/80 hover:text-white transition-colors">
                المفضلة
              </Link>
              <Link href="/cart" className="block text-white/80 hover:text-white transition-colors">
                سلة التسوق
              </Link>
              <Link href="/profile" className="block text-white/80 hover:text-white transition-colors">
                الملف الشخصي
              </Link>
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center lg:text-right"
          >
            <h4 className="text-lg font-semibold text-white mb-4">معلومات التواصل</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-start space-x-2 space-x-reverse">
                <Phone size={16} className="text-white" />
                <span className="text-white/80">+971 50 123 4567</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 space-x-reverse">
                <Mail size={16} className="text-white" />
                <span className="text-white/80">info@almasya.com</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 space-x-reverse">
                <MapPin size={16} className="text-white" />
                <span className="text-white/80">دبي، الإمارات العربية المتحدة</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-12 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}></div>
          </div>
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="text-sm font-bold text-white bg-gradient-to-r from-gray-300/20 to-gray-300/10 px-6 py-3 rounded-full shadow-lg border border-gray-300/30">
                <Gift className="w-4 h-4 inline mr-2 text-gray-300" />
                اشترك في النشرة البريدية
              </span>
            </motion.div>
            
            <motion.h4 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-3"
            >
              احصل على آخر العروض
            </motion.h4>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/80 mb-8 max-w-2xl mx-auto"
            >
              اشترك في نشرتنا البريدية واحصل على آخر العروض والمنتجات الجديدة مباشرة في بريدك الإلكتروني
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-full focus:ring-2 focus:ring-gray-300/50 focus:border-transparent text-right transition-all placeholder:text-gray-500 placeholder:opacity-100 bg-white/90 text-gray-900 border border-white/20 backdrop-blur-sm"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <motion.button 
                onClick={handleSubscribe} 
                disabled={submitting}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-gray-300 to-gray-400 text-[#1c1a24] rounded-full font-semibold shadow-2xl border border-gray-300/30 overflow-hidden disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {submitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      اشتراك
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="mr-2"
                      >
                        →
                      </motion.span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </motion.div>
            
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-white/90 bg-white/10 px-4 py-2 rounded-full inline-block"
              >
                {message}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center md:text-right text-white/80"
            >
              <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse">
                <span>© {new Date().getFullYear()} Almasya. All rights reserved</span>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4"
                >
                  <Sparkle className="w-4 h-4 text-gray-300" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center space-x-6 space-x-reverse text-white/80"
            >
              <Link href="/privacy" className="hover:text-white transition-colors duration-300 hover:scale-105">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-300 hover:scale-105">
                شروط الاستخدام
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center mt-6 text-white/70 text-sm"
          >
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <span>
          <a href="http://viralx.agency" className='font-bold text-md underline '> بواسطة - viralx.agency</a>
            </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;



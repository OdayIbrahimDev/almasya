'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { couponAPI } from '../../service/api';

interface CouponInputProps {
  onCouponApplied: (coupon: any, discount: number) => void;
  onCouponRemoved: () => void;
  orderAmount: number;
  productIds: string[];
  className?: string;
}

interface CouponValidationResult {
  coupon: {
    _id: string;
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    maxDiscount?: number;
  };
  discount: number;
  isValid: boolean;
  applicableProducts?: Array<{ id: string; name: string; price: number }>;
  message?: string;
}

const CouponInput = ({ onCouponApplied, onCouponRemoved, orderAmount, productIds, className = '' }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<CouponValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setError('يرجى إدخال رمز الكوبون');
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await couponAPI.validate({
        code: couponCode.trim(),
        orderAmount,
        productIds
      });

      const result = response.data;
      setValidationResult(result);

      if (result.isValid) {
        setError(null);
        // Auto-apply valid coupon
        handleApplyCoupon(result);
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('حدث خطأ في التحقق من الكوبون');
      }
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async (result: CouponValidationResult) => {
    try {
      // Increment usage count
      await couponAPI.apply(result.coupon._id);
      
      setAppliedCoupon(result);
      onCouponApplied(result.coupon, result.discount);
      
      // Clear input and validation
      setCouponCode('');
      setValidationResult(null);
      setError(null);
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError('حدث خطأ في تطبيق الكوبون');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    onCouponRemoved();
  };

  const formatDiscount = (discount: number) => {
    return new Intl.NumberFormat('ar-UAE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0
    }).format(discount);
  };

  const formatOrderAmount = (amount: number) => {
    return new Intl.NumberFormat('ar-UAE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (appliedCoupon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-green-800">كوبون مطبق: {appliedCoupon.coupon.code}</span>
                <span className="text-sm text-green-600">({appliedCoupon.coupon.name})</span>
              </div>
              <p className="text-sm text-green-700">
                خصم: {formatDiscount(appliedCoupon.discount)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="أدخل رمز الكوبون"
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#211c31] focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleValidateCoupon()}
            />
          </div>
        </div>
        <button
          onClick={handleValidateCoupon}
          disabled={isLoading || !couponCode.trim()}
          className="px-6 py-3 bg-gray-300 text-[#211c31] rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'جاري التحقق...' : 'تطبيق'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Validation Result */}
      {validationResult && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">كوبون صالح</span>
            </div>
            <button
              onClick={() => handleApplyCoupon(validationResult)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              تطبيق الكوبون
            </button>
          </div>
          
                     <div className="space-y-2 text-sm text-blue-700">
             <p><strong>اسم الكوبون:</strong> {validationResult.coupon.name}</p>
             {validationResult.coupon.description && (
               <p><strong>الوصف:</strong> {validationResult.coupon.description}</p>
             )}
             <p><strong>نوع الخصم:</strong> {validationResult.coupon.type === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}</p>
             <p><strong>قيمة الخصم:</strong> {validationResult.coupon.value} {validationResult.coupon.type === 'percentage' ? '%' : 'د.أ'}</p>
             <p><strong>مبلغ الخصم:</strong> {formatDiscount(validationResult.discount)}</p>
             {validationResult.coupon.minOrderAmount > 0 && (
               <p><strong>الحد الأدنى للطلب:</strong> {formatOrderAmount(validationResult.coupon.minOrderAmount)}</p>
             )}
             {validationResult.coupon.maxDiscount && (
               <p><strong>أقصى خصم:</strong> {formatDiscount(validationResult.coupon.maxDiscount)}</p>
             )}
             
             {/* Show which products the coupon applies to */}
             {validationResult.applicableProducts && validationResult.applicableProducts.length > 0 && (
               <div className="mt-3 pt-3 border-t border-blue-200">
                 <p className="font-semibold text-blue-800 mb-2">المنتجات المؤهلة للخصم:</p>
                 <div className="space-y-1">
                   {validationResult.applicableProducts.map(product => (
                     <div key={product.id} className="flex justify-between text-xs">
                       <span>{product.name}</span>
                       <span className="text-blue-600">{formatOrderAmount(product.price)}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
             {/* Show message about partial application */}
             {validationResult.message && (
               <div className="mt-3 pt-3 border-t border-blue-200">
                 <p className="text-sm font-medium text-blue-800">{validationResult.message}</p>
               </div>
             )}
           </div>
        </motion.div>
      )}

             {/* Info Message */}
       <div className="text-xs text-gray-500 text-center">
         <p>💡 الكوبون سيتم تطبيقه فقط على المنتجات التي لا تحتوي على عروض خصم</p>
       </div>
    </div>
  );
};

export default CouponInput;

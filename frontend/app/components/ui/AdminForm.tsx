'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

interface AdminFormProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'file' | 'date' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  className?: string;
}

const AdminForm = ({
  title,
  subtitle,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitText = 'حفظ',
  cancelText = 'إلغاء',
  isLoading = false,
  mode = 'create',
  className = ''
}: AdminFormProps) => {
  const [formData, setFormData] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name: string, value: any): string | null => {
    const field = fields.find(f => f.name === name);
    if (!field) return null;

    // Required validation
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} مطلوب`;
    }

    // Custom validation
    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isPassword = field.type === 'password';
    const showPasswordForField = showPassword[field.name];

    const commonProps = {
      className: `w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#a075ad] focus:border-transparent ${
        error 
          ? 'border-red-300 bg-red-50' 
          : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-white'
      } ${field.className || ''}`,
      placeholder: field.placeholder,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(field.name, e.target.value),
      required: field.required
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-none`}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">اختر {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'file':
        return (
          <div className="relative">
            <input
              type="file"
              className="hidden"
              id={field.name}
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleInputChange(field.name, file);
              }}
            />
            <label
              htmlFor={field.name}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus size={20} className="text-gray-400" />
              <span className="text-gray-600">
                {value ? value.name || 'تم اختيار ملف' : `اختر ${field.label}`}
              </span>
            </label>
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="w-5 h-5 text-[#a075ad] border-gray-300 rounded focus:ring-[#a075ad] focus:ring-2"
            />
            <span className="text-gray-700">{field.label}</span>
          </label>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={showPasswordForField ? 'text' : 'password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, [field.name]: !showPasswordForField }))}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPasswordForField ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        );

      default:
        return <input {...commonProps} type={field.type} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-300 to-black px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            {mode === 'create' ? (
              <Plus size={24} className="text-white" />
            ) : (
              <Edit3 size={24} className="text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-white/80 text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={field.type === 'textarea' || field.type === 'checkbox' ? 'md:col-span-2' : ''}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 mr-1">*</span>}
              </label>
              
              {renderField(field)}
              
              <AnimatePresence>
                {errors[field.name] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm mt-2 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {errors[field.name]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-gray-300 to-black text-white py-3 px-6 rounded-xl font-semibold hover:from-gray-400 hover:to-black/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Save size={20} />
            )}
            {isLoading ? 'جاري الحفظ...' : submitText}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              <X size={20} />
              {cancelText}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default AdminForm;

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true
}: ModalProps) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={24} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-[gray-300]" />;
      default:
        return <Info size={24} className="text-blue-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-[gray-300]/20';
      default:
        return 'bg-blue-100';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`w-full ${getSizeClasses()} bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  {title && (
                    <div className="flex items-center gap-3">
                      {type !== 'confirm' && (
                        <div className={`p-2 rounded-lg ${getIconBg()}`}>
                          {getIcon()}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-6">
              {children ? (
                children
              ) : (
                message && (
                  <div className="text-center">
                    {type === 'confirm' && (
                      <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-[gray-300]/20 rounded-full flex items-center justify-center mb-4">
                          <AlertTriangle size={32} className="text-[gray-300]" />
                        </div>
                      </div>
                    )}
                    <p className="text-gray-700 text-lg leading-relaxed">{message}</p>
                  </div>
                )
              )}
            </div>

            {/* Actions */}
            {(onConfirm || onCancel) && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-3 justify-end">
                  {onCancel && (
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      {cancelText}
                    </button>
                  )}
                  {onConfirm && (
                    <button
                      onClick={handleConfirm}
                      className={`px-6 py-2.5 text-white rounded-xl font-medium transition-all duration-200 ${
                        type === 'error' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : type === 'warning'
                          ? 'bg-[gray-300] hover:bg-gray-500'
                          : 'bg-red-400 hover:bg-gray-500'
                      }`}
                    >
                      {confirmText}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

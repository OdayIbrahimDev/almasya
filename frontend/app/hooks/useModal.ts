import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false
  });

  const openModal = useCallback((config: Omit<ModalState, 'isOpen'>) => {
    setModalState({ ...config, isOpen: true });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods for different modal types
  const showSuccess = useCallback((message: string, title?: string) => {
    openModal({
      type: 'success',
      title: title || 'نجح العملية',
      message,
      size: 'sm'
    });
  }, [openModal]);

  const showError = useCallback((message: string, title?: string) => {
    openModal({
      type: 'error',
      title: title || 'حدث خطأ',
      message,
      size: 'sm'
    });
  }, [openModal]);

  const showInfo = useCallback((message: string, title?: string) => {
    openModal({
      type: 'info',
      title: title || 'معلومات',
      message,
      size: 'sm'
    });
  }, [openModal]);

  const showWarning = useCallback((message: string, title?: string) => {
    openModal({
      type: 'warning',
      title: title || 'تحذير',
      message,
      size: 'sm'
    });
  }, [openModal]);

  const showConfirm = useCallback((
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    title?: string,
    confirmText?: string,
    cancelText?: string
  ) => {
    openModal({
      type: 'confirm',
      title: title || 'تأكيد العملية',
      message,
      onConfirm,
      onCancel,
      confirmText: confirmText || 'تأكيد',
      cancelText: cancelText || 'إلغاء',
      size: 'sm'
    });
  }, [openModal]);

  const showCustom = useCallback((config: Omit<ModalState, 'isOpen'>) => {
    openModal(config);
  }, [openModal]);

  return {
    modalState,
    openModal,
    closeModal,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    showCustom
  };
};

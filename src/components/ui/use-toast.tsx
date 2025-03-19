import React from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
}

// A simple mock toast function that does nothing but provides the expected interface
export const toast = (props: ToastProps) => {
  console.log('Toast:', props);
  // In a real implementation, this would show a toast notification
  return { id: Date.now() };
};

export const useToast = () => {
  return {
    toast,
    dismiss: (toastId: number) => {
      console.log('Dismiss toast:', toastId);
    },
  };
};

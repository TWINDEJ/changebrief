'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400';

  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-xl border backdrop-blur-xl px-5 py-3 text-sm font-medium shadow-2xl ${bg}`}>
      {message}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const show = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });
  const clear = () => setToast(null);
  return { toast, show, clear };
}

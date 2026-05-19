'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    addToast(message, type);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = {
            success: CheckCircle2,
            error: AlertTriangle,
            info: Info,
          }[t.type];

          return (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl border shadow-xl animate-slide-up text-xs font-semibold leading-snug select-none",
                {
                  'bg-emerald-50 border-emerald-100 text-emerald-800': t.type === 'success',
                  'bg-red-50 border-red-100 text-red-800': t.type === 'error',
                  'bg-slate-50 border-slate-100 text-slate-800': t.type === 'info',
                }
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 active:scale-90 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

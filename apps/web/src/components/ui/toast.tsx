'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'border-buy/50 bg-buy/10',
  error: 'border-sell/50 bg-sell/10',
  warning: 'border-yellow-500/50 bg-yellow-500/10',
  info: 'border-blue-500/50 bg-blue-500/10',
};

const iconStyles = {
  success: 'text-buy',
  error: 'text-sell',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 fade-in duration-300',
              'max-w-sm',
              toastStyles[toast.type]
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', iconStyles[toast.type])} />
            <div className="flex-1 space-y-1">
              <p className="font-medium text-foreground">{toast.title}</p>
              {toast.message && (
                <p className="text-sm text-muted-foreground">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Hook for easy toast creation
export function useToast() {
  const { addToast } = useToastStore();

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
  };
}

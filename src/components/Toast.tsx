import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg bg-white transition-all transform animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'border-emerald-200 text-emerald-900'
              : toast.type === 'error'
              ? 'border-rose-200 text-rose-900'
              : 'border-blue-200 text-blue-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs">
            <h4 className="font-semibold text-zinc-900">{toast.title}</h4>
            {toast.message && <p className="mt-0.5 text-zinc-600 leading-relaxed">{toast.message}</p>}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded-sm transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

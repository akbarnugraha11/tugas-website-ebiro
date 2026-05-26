'use client';

import { useEPinjam } from '@/lib/state-context';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ToastContainer() {
  const { toasts, removeToast } = useEPinjam();

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none" id="toast-wrapper">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-900/90 border-slate-700/80';
          let icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
          
          if (toast.type === 'success') {
            bgColor = 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200';
            icon = <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-950/80 border-amber-500/30 text-amber-200';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-950/80 border-rose-500/30 text-rose-200';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, x: 50 }}
              className={`p-4 rounded-xl border backdrop-blur-md pointer-events-auto shadow-2xl flex items-start gap-3 ${bgColor}`}
              id={`toast-${toast.id}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium pr-2">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer mt-0.5"
                id={`btn-close-toast-${toast.id}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

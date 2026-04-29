import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export const ConfirmationModal = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Delete", 
  variant = "danger",
  isSubmitting = false
}: { 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void,
  confirmText?: string,
  variant?: "danger" | "primary",
  isSubmitting?: boolean
}) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden my-auto"
      >
        <div className="p-6 sm:p-8 text-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
            variant === "danger" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
          )}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500 leading-relaxed mb-8">{message}</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 text-white rounded-2xl font-bold shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2",
                variant === "danger" ? "bg-rose-600 shadow-rose-200 hover:bg-rose-700" : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
              )}
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

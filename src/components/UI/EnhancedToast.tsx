// ===========================================
// Enhanced Toast Component
// Advanced notification system with actions and swipe
// ===========================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  RefreshCcw,
  Undo2,
  ChevronRight,
} from 'lucide-react';
import { toastVariants } from '../../utils/animations';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface EnhancedToastProps {
  id: string | number;
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
  onDismiss?: (id: string | number) => void;
  showDismiss?: boolean;
  customIcon?: React.ReactNode;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

const toastIconStyles: Record<ToastType, string> = {
  success: 'bg-green-100',
  error: 'bg-red-100',
  warning: 'bg-amber-100',
  info: 'bg-blue-100',
};

export function EnhancedToast({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  action,
  onDismiss,
  showDismiss = true,
  customIcon,
}: EnhancedToastProps) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.(id);
    }, 200);
  }, [id, onDismiss]);

  // Auto-dismiss timer
  React.useEffect(() => {
    if (duration > 0 && !isExiting) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss, isExiting]);

  const handleDragEnd = (event: any, info: { offset: { x: number } }) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      handleDismiss();
    }
    setIsSwiping(false);
  };

  return (
    <motion.div
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border shadow-lg
        max-w-sm w-full cursor-grab active:cursor-grabbing
        ${toastStyles[type]}
      `}
      variants={toastVariants}
      initial="initial"
      animate={isExiting ? 'exit' : 'animate'}
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsSwiping(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: isSwiping ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${toastIconStyles[type]}`}>
        {customIcon || toastIcons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
        {message && (
          <p className="text-sm text-slate-600 mt-0.5">{message}</p>
        )}

        {/* Actions */}
        {action && (
          <div className="flex items-center gap-2 mt-3">
            <motion.button
              onClick={action.onClick}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg
                transition-colors
                ${
                  action.variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : action.variant === 'secondary'
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {action.label}
            </motion.button>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {showDismiss && (
        <motion.button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4 text-slate-400" />
        </motion.button>
      )}

      {/* Swipe indicator */}
      {isSwiping && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
}

// Toast Provider / Container
export interface ToastItem extends Omit<EnhancedToastProps, 'id'> {
  id: string | number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string | number) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionClasses: Record<string, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: ToastContainerProps) {
  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 pointer-events-none ${positionClasses[position]}`}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <EnhancedToast {...toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Toast queue manager (custom hook)
export function useToastQueue() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...toast, id }]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string | number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (title: string, message?: string, action?: ToastAction) => {
      return addToast({ type: 'success', title, message, action });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, action?: ToastAction) => {
      return addToast({ type: 'error', title, message, action });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, action?: ToastAction) => {
      return addToast({ type: 'warning', title, message, action });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, action?: ToastAction) => {
      return addToast({ type: 'info', title, message, action });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    dismissToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}

export default EnhancedToast;

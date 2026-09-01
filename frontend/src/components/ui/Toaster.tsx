import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toastDismissed, type ToastMessage } from '@/features/ui/uiSlice';
import { cn } from '@/lib/utils';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

// The 500 steps are fill colours, not type colours — on a light toast they
// sit near 3:1. Stepping per theme keeps the status icon readable on both.
const ACCENT = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-rose-600 dark:text-rose-400',
  info: 'text-brand-600 dark:text-brand-400',
} as const;

function Toast({ toast }: { toast: ToastMessage }) {
  const dispatch = useAppDispatch();
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(toastDismissed(toast.id)), 5000);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <motion.div
      layout
      role={toast.variant === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ type: 'spring', damping: 24, stiffness: 340 }}
      className="glass-strong pointer-events-auto flex w-full items-start gap-3 rounded-2xl p-4 shadow-lift"
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', ACCENT[toast.variant])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && <p className="text-muted mt-0.5 text-sm">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dispatch(toastDismissed(toast.id))}
        aria-label="Dismiss notification"
        className="text-muted -mt-1 -mr-1 rounded-full p-1 transition-colors hover:text-[var(--text-strong)]"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-20 z-200 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:w-96"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Full-height sheet on mobile, centered dialog from `sm` up. */
  sheetOnMobile?: boolean;
}

const SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  sheetOnMobile = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog for screen reader and keyboard users.
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Dialog'}
            tabIndex={-1}
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col border border-[var(--border-subtle)] bg-[var(--surface-overlay)] shadow-lift outline-none',
              sheetOnMobile ? 'rounded-t-4xl sm:rounded-3xl' : 'rounded-3xl',
              SIZES[size],
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {sheetOnMobile && (
              <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[var(--border-subtle)] sm:hidden" />
            )}

            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
                <div className="min-w-0">
                  {title && <h2 className="font-display text-xl font-semibold">{title}</h2>}
                  {description && <p className="text-muted mt-1 text-sm">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="text-muted -mr-1 shrink-0 rounded-full p-1.5 transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)]"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && <div className="border-t px-6 py-4 pb-safe">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

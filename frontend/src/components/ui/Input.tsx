import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

const fieldBase = [
  'w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4',
  'text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)]',
  'transition-[border-color,box-shadow,background-color] duration-200',
  'hover:border-strong',
  // Ring instead of outline so the field grows a halo rather than shifting.
  'focus:border-[var(--ring-brand)] focus:ring-4 focus:ring-[var(--ring-brand)]/18 focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-500/20',
].join(' ');

interface FieldShellProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--text-strong)]">
          {label}
          {required && (
            <span className="ml-0.5 text-rose-600" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-faint mt-1.5 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  className,
  label,
  error,
  hint,
  leftIcon,
  rightSlot,
  id,
  ref,
  ...props
}: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} required={props.required}>
      <div className="relative">
        {leftIcon && (
          <span
            className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            fieldBase,
            'h-11',
            leftIcon && 'pl-11',
            rightSlot && 'pr-11',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
        {rightSlot && (
          <span className="absolute top-1/2 right-2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    </FieldShell>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, label, error, hint, id, ref, ...props }: TextareaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} required={props.required}>
      <textarea
        ref={ref}
        id={fieldId}
        className={cn(fieldBase, 'min-h-28 resize-y py-3', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ className, label, error, hint, id, children, ref, ...props }: SelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} required={props.required}>
      <select
        ref={ref}
        id={fieldId}
        className={cn(fieldBase, 'h-11 cursor-pointer appearance-none bg-no-repeat pr-10', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.25rem',
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ className, label, id, ref, ...props }: CheckboxProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label
      htmlFor={fieldId}
      className={cn('flex cursor-pointer items-start gap-2.5 text-sm select-none', className)}
    >
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-2 accent-brand-600"
        {...props}
      />
      <span className="text-[var(--text-strong)]">{label}</span>
    </label>
  );
}

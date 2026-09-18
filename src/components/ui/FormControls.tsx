import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@utils/format';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className, children, id, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? <span className="text-sm font-medium text-gray-300">{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none transition',
          'focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20',
          error && 'border-red-500/60',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const areaId = id || props.name;
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? <span className="text-sm font-medium text-gray-300">{label}</span> : null}
      <textarea
        id={areaId}
        className={cn(
          'min-h-[110px] w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition',
          'focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20',
          error && 'border-red-500/60',
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

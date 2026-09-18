import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@utils/format';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <label className="flex w-full flex-col gap-1.5">
        {label ? (
          <span className="text-sm font-medium text-gray-300">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition',
            'border-white/10 focus:border-brand-orange/60 focus:ring-2 focus:ring-brand-orange/20',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
        {!error && hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </label>
    );
  }
);

Input.displayName = 'Input';

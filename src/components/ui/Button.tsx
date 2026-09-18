import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/format';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/60 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-brand-orange text-black shadow-glow-sm hover:bg-brand-orange-hover',
    secondary:
      'border border-brand-border bg-brand-surface text-white hover:border-brand-orange/50 hover:bg-brand-charcoal',
    ghost: 'bg-transparent text-gray-300 hover:bg-white/5 hover:text-white',
    danger:
      'border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

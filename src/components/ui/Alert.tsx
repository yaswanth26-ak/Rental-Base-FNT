import { cn } from '@utils/format';
import type { ReactNode } from 'react';

interface AlertProps {
  tone?: 'error' | 'success' | 'info';
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'error', children, className }: AlertProps) {
  const tones = {
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    info: 'border-brand-orange/30 bg-brand-orange/10 text-orange-200',
  };

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border px-3.5 py-3 text-sm leading-relaxed',
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}

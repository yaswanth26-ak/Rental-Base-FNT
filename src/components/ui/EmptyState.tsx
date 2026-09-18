import type { ReactNode } from 'react';
import { cn } from '@utils/format';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-surface/60 px-6 py-14 text-center',
        className
      )}
    >
      {icon ? <div className="mb-4 text-brand-orange">{icon}</div> : null}
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-gray-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

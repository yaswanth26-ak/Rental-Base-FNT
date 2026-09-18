import { cn } from '@utils/format';

interface SpinnerProps {
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export function Spinner({ label, className, size = 'md' }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-brand-orange/30 border-t-brand-orange',
          sizeMap[size]
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label ? <p className="text-sm text-gray-400">{label}</p> : null}
    </div>
  );
}

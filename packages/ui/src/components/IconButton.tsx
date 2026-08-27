import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: LucideIcon;
  /** Required — no icon-only control may be ambiguous to a screen reader. */
  'aria-label': string;
  variant?: 'default' | 'subtle';
}

export function IconButton({ icon: Icon, variant = 'default', className = '', ...rest }: IconButtonProps) {
  const base =
    variant === 'subtle'
      ? 'bg-transparent text-anthracite hover:bg-anthracite/5'
      : 'bg-anthracite/5 text-anthracite hover:bg-anthracite/10';
  return (
    <button
      className={`inline-flex items-center justify-center rounded-control min-h-[44px] min-w-[44px] transition-colors duration-base ${base} ${className}`}
      {...rest}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}

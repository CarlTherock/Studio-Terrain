import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-terracotta text-white hover:brightness-95',
  secondary: 'bg-petrol text-white hover:brightness-95',
  ghost: 'bg-transparent text-anthracite hover:bg-anthracite/5',
  danger: 'bg-danger text-white hover:brightness-95',
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-control px-4 min-h-[44px] min-w-[44px] font-medium transition-colors duration-base disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...rest}
    />
  );
}

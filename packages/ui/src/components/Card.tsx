import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-card bg-white/70 shadow-sm ring-1 ring-anthracite/10 p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

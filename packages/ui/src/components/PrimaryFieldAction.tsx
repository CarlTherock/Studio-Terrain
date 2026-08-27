import { Plus } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

export interface PrimaryFieldActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * The field's central, thumb-reachable primary action ("Ajouter au chantier").
 * Fixed above the bottom nav on mobile.
 */
export function PrimaryFieldAction({ label = 'Ajouter au chantier', className = '', ...rest }: PrimaryFieldActionProps) {
  return (
    <button
      type="button"
      className={`fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-terracotta text-white px-5 min-h-[52px] shadow-lg font-semibold transition-transform duration-base active:scale-95 ${className}`}
      {...rest}
    >
      <Plus size={22} aria-hidden="true" />
      {label}
    </button>
  );
}

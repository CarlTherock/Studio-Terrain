import type { LucideIcon } from 'lucide-react';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onClick?: () => void;
}

export interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 bg-ivory/95 backdrop-blur border-t border-anthracite/10 flex justify-around py-1 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            title={item.disabled ? item.disabledHint : undefined}
            aria-current={item.active ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 min-h-[44px] min-w-[44px] px-2 py-1.5 rounded-control transition-colors duration-base ${
              item.active ? 'text-terracotta-text' : 'text-anthracite/70'
            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-anthracite/5'}`}
          >
            <Icon size={22} aria-hidden="true" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

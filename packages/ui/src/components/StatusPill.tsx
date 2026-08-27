import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export type SyncStatusLabel = 'synchronise' | 'en_attente' | 'conflit';

export interface StatusPillProps {
  status: SyncStatusLabel;
  pendingCount?: number;
}

const config: Record<SyncStatusLabel, { icon: typeof CheckCircle2; text: (n?: number) => string; tone: string }> = {
  synchronise: { icon: CheckCircle2, text: () => 'Synchronisé', tone: 'bg-sage/15 text-sage-text' },
  en_attente: {
    icon: RefreshCw,
    text: (n) => `${n ?? 0} élément${(n ?? 0) > 1 ? 's' : ''} en attente`,
    tone: 'bg-petrol/10 text-petrol-text',
  },
  conflit: { icon: AlertTriangle, text: () => 'Conflit à résoudre', tone: 'bg-danger/10 text-danger-text' },
};

export function StatusPill({ status, pendingCount }: StatusPillProps) {
  const { icon: Icon, text, tone } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${tone}`}
      role="status"
    >
      <Icon size={16} aria-hidden="true" />
      {text(pendingCount)}
    </span>
  );
}

import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Video,
  Files,
  Timer,
  FileBarChart,
  Search,
  Camera,
  WifiOff,
} from 'lucide-react';
import { BottomNav, StatusPill, type BottomNavItem } from '@studio-terrain/ui';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface NavEntry {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  to?: string;
  disabledHint?: string;
}

const SIDEBAR_ENTRIES: NavEntry[] = [
  { key: 'accueil', label: 'Accueil', icon: LayoutDashboard, to: '/' },
  { key: 'projets', label: 'Projets', icon: FolderKanban, to: '/projects' },
  { key: 'taches', label: 'Tâches', icon: ListChecks, to: '/tasks' },
  { key: 'reunions', label: 'Réunions', icon: Video, disabledHint: 'Bientôt disponible' },
  { key: 'documents', label: 'Documents', icon: Files, disabledHint: 'Bientôt disponible' },
  { key: 'temps', label: 'Temps', icon: Timer, disabledHint: 'Bientôt disponible' },
  { key: 'rapports', label: 'Rapports', icon: FileBarChart, disabledHint: 'Bientôt disponible' },
];

const BOTTOM_NAV_ENTRIES: NavEntry[] = [
  { key: 'accueil', label: 'Accueil', icon: LayoutDashboard, to: '/' },
  { key: 'projets', label: 'Projets', icon: FolderKanban, to: '/projects' },
  { key: 'terrain', label: 'Terrain', icon: Camera, to: '/observations/new' },
  { key: 'reunions', label: 'Réunions', icon: Video, disabledHint: 'Bientôt disponible' },
  { key: 'recherche', label: 'Recherche', icon: Search, to: '/search' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const sync = useSyncStatus();
  const online = useOnlineStatus();

  const bottomItems: BottomNavItem[] = BOTTOM_NAV_ENTRIES.map((entry) => ({
    key: entry.key,
    label: entry.label,
    icon: entry.icon,
    active: entry.to === location.pathname,
    disabled: !entry.to,
    disabledHint: entry.disabledHint,
    onClick: entry.to ? () => navigate(entry.to as string) : undefined,
  }));

  return (
    <div className="min-h-screen flex bg-ivory text-anthracite">
      <aside
        aria-label="Navigation principale"
        className="hidden md:flex flex-col w-20 bg-anthracite text-ivory py-6 gap-1 shrink-0"
      >
        {SIDEBAR_ENTRIES.map((entry) => {
          const Icon = entry.icon;
          const active = entry.to === location.pathname;
          const content = (
            <div
              className={`flex flex-col items-center gap-1 py-3 mx-2 rounded-control transition-colors duration-base ${
                active ? 'bg-terracotta text-white' : 'text-ivory/70 hover:bg-ivory/10'
              } ${!entry.to ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={entry.disabledHint}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="text-[10px] font-medium">{entry.label}</span>
            </div>
          );
          return entry.to ? (
            <NavLink key={entry.key} to={entry.to} aria-label={entry.label}>
              {content}
            </NavLink>
          ) : (
            <div key={entry.key} aria-disabled="true">
              {content}
            </div>
          );
        })}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-3 px-4 md:px-8 py-4 border-b border-anthracite/10">
          <span className="font-serif text-lg font-semibold tracking-tight">StudioTerrain</span>
          <div className="flex items-center gap-2">
            {!online && (
              <span
                role="status"
                className="inline-flex items-center gap-1.5 rounded-full bg-anthracite/10 px-3 py-1.5 text-sm font-medium text-anthracite"
              >
                <WifiOff size={16} aria-hidden="true" />
                Hors ligne
              </span>
            )}
            <StatusPill status={sync.label} pendingCount={sync.pendingCount} />
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-28 md:pb-6">{children}</main>
      </div>

      <div className="md:hidden">
        <BottomNav items={bottomItems} />
      </div>
    </div>
  );
}

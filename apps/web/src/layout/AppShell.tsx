import { useState, type ReactNode } from 'react';
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
  Menu,
  X,
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
  { key: 'documents', label: 'Documents', icon: Files, to: '/documents' },
  { key: 'temps', label: 'Temps', icon: Timer, to: '/time' },
  { key: 'rapports', label: 'Rapports', icon: FileBarChart, disabledHint: 'Bientôt disponible' },
];

const BOTTOM_NAV_ENTRIES: NavEntry[] = [
  { key: 'accueil', label: 'Accueil', icon: LayoutDashboard, to: '/' },
  { key: 'projets', label: 'Projets', icon: FolderKanban, to: '/projects' },
  { key: 'terrain', label: 'Terrain', icon: Camera, to: '/observations/new' },
  { key: 'reunions', label: 'Réunions', icon: Video, disabledHint: 'Bientôt disponible' },
  { key: 'recherche', label: 'Recherche', icon: Search, to: '/search' },
];

function SidebarNavList({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <>
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
          <NavLink key={entry.key} to={entry.to} aria-label={entry.label} onClick={onNavigate}>
            {content}
          </NavLink>
        ) : (
          <div key={entry.key} aria-disabled="true">
            {content}
          </div>
        );
      })}
    </>
  );
}

function MobileMenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fermer le menu"
        className="absolute inset-0 bg-anthracite/40"
        onClick={onClose}
      />
      <nav
        aria-label="Menu complet"
        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-anthracite text-ivory py-6 px-2 overflow-y-auto"
        style={{ paddingLeft: 'max(0.5rem, env(safe-area-inset-left))' }}
      >
        <div className="flex items-center justify-between px-3 mb-4">
          <span className="font-serif text-lg font-semibold">StudioTerrain</span>
          <button type="button" onClick={onClose} aria-label="Fermer le menu" className="p-2">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ul className="space-y-1">
          {SIDEBAR_ENTRIES.map((entry) => {
            const Icon = entry.icon;
            const active = entry.to === location.pathname;
            const content = (
              <div
                className={`flex items-center gap-3 px-3 py-3 rounded-control transition-colors duration-base ${
                  active ? 'bg-terracotta text-white' : 'text-ivory/80 hover:bg-ivory/10'
                } ${!entry.to ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={entry.disabledHint}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-sm font-medium">{entry.label}</span>
              </div>
            );
            return (
              <li key={entry.key}>
                {entry.to ? (
                  <NavLink to={entry.to} aria-label={entry.label} onClick={onClose}>
                    {content}
                  </NavLink>
                ) : (
                  <div aria-disabled="true">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const sync = useSyncStatus();
  const online = useOnlineStatus();
  const [menuOpen, setMenuOpen] = useState(false);

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
        className="hidden md:flex flex-col w-20 bg-anthracite text-ivory py-6 gap-1 shrink-0 pl-[env(safe-area-inset-left)]"
      >
        <SidebarNavList />
      </aside>

      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between gap-3 py-4 border-b border-anthracite/10 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:pl-[max(2rem,env(safe-area-inset-left))] md:pr-[max(2rem,env(safe-area-inset-right))]"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="md:hidden p-2 -ml-2 rounded-control hover:bg-anthracite/5"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <span className="font-serif text-lg font-semibold tracking-tight">StudioTerrain</span>
          </div>
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

        <main className="flex-1 py-6 pb-28 md:pb-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:pl-[max(2rem,env(safe-area-inset-left))] md:pr-[max(2rem,env(safe-area-inset-right))]">
          {children}
        </main>
      </div>

      <div className="md:hidden">
        <BottomNav items={bottomItems} />
      </div>
    </div>
  );
}

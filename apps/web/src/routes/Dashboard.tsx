import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ClipboardList, FolderKanban } from 'lucide-react';
import { Card, PrimaryFieldAction } from '@studio-terrain/ui';
import { useObservations, useProjects, useTasks } from '../hooks/queries';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { PROJECT_STATUS_LABELS } from '../constants/labels';

function CircularStat({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-16 h-16 rounded-full grid place-items-center"
        style={{
          background: `conic-gradient(#C1613D ${pct}%, rgba(43,46,51,0.08) ${pct}%)`,
        }}
      >
        <div className="w-12 h-12 rounded-full bg-ivory grid place-items-center text-sm font-semibold">
          {value}
        </div>
      </div>
      <span className="text-xs text-anthracite/70">{label}</span>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjects();
  const tasks = useTasks();
  const observations = useObservations(projects.data?.[0]?.id);
  const sync = useSyncStatus();

  const activeProjects = projects.data?.filter((p) => p.status !== 'termine') ?? [];
  const doneTasks = tasks.data?.filter((t) => t.status === 'resolue').length ?? 0;
  const totalTasks = tasks.data?.length ?? 0;
  const recentObservations = (observations.data ?? []).slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Cockpit</h1>
          <p className="text-anthracite/60 text-sm">Vue d'ensemble de vos projets et de vos observations récentes.</p>
        </div>
        <Link
          to="/sync"
          className="text-sm text-petrol-text underline underline-offset-2 hover:no-underline"
        >
          Détail de la synchronisation
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center gap-2 py-6">
          <FolderKanban size={22} className="text-terracotta-text" aria-hidden="true" />
          <span className="text-2xl font-semibold">{activeProjects.length}</span>
          <span className="text-xs text-anthracite/60">Projets actifs</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-2 py-6">
          <CircularStat label="Tâches" value={doneTasks} total={totalTasks} />
        </Card>
        <Card className="flex flex-col items-center justify-center gap-2 py-6">
          <ClipboardList size={22} className="text-sage-text" aria-hidden="true" />
          <span className="text-2xl font-semibold">{recentObservations.length}</span>
          <span className="text-xs text-anthracite/60">Observations récentes</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-2 py-6">
          <AlertTriangle
            size={22}
            className={sync.conflictCount > 0 ? 'text-danger-text' : 'text-anthracite/30'}
            aria-hidden="true"
          />
          <span className="text-2xl font-semibold">{sync.conflictCount}</span>
          <span className="text-xs text-anthracite/60">Conflits à résoudre</span>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Projets</h2>
          <Link to="/projects/new" className="text-sm text-terracotta-text underline underline-offset-2">
            Nouveau projet
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <p className="text-sm text-anthracite/60">
            Aucun projet pour l'instant. Créez votre premier client, puis un projet.
          </p>
        ) : (
          <ul className="divide-y divide-anthracite/10">
            {activeProjects.map((project) => (
              <li key={project.id} className="py-3">
                <Link to={`/projects/${project.id}`} className="font-medium hover:text-terracotta-text">
                  {project.name}
                </Link>
                <span className="ml-2 text-xs uppercase tracking-wide text-anthracite/50">
                  {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <PrimaryFieldAction onClick={() => navigate('/observations/new')} label="Ajouter au chantier" />
    </div>
  );
}

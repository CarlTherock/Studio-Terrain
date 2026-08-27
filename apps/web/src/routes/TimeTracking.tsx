import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { computeDurationMinutes, formatDurationMinutes, type TimeEntryCategory } from '@studio-terrain/domain';
import { Button, Card } from '@studio-terrain/ui';
import { useProjects, useRunningTimeEntry, useStartTimeEntry, useStopTimeEntry, useTimeEntries } from '../hooks/queries';

const CATEGORY_LABELS: Record<TimeEntryCategory, string> = {
  bureau: 'Bureau',
  trajet: 'Trajet',
  chantier: 'Chantier',
  reunion: 'Réunion',
  conception: 'Conception',
  administration: 'Administration',
};

function useTick(enabled: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
}

export function TimeTracking() {
  const [searchParams] = useSearchParams();
  const projects = useProjects();
  const [projectId, setProjectId] = useState(searchParams.get('projectId') ?? '');
  const [category, setCategory] = useState<TimeEntryCategory>('chantier');
  const [billable, setBillable] = useState(true);

  const { running } = useRunningTimeEntry(projectId || undefined);
  const entries = useTimeEntries(projectId || undefined);
  const start = useStartTimeEntry();
  const stop = useStopTimeEntry();

  useTick(Boolean(running));

  const totalMinutes = (entries.data ?? []).reduce(
    (sum, entry) => sum + computeDurationMinutes(entry),
    0,
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Temps</h1>

      <Card>
        <label htmlFor="time-project" className="block text-sm font-medium mb-1">
          Projet
        </label>
        <select
          id="time-project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
        >
          <option value="" disabled>
            Sélectionner un projet
          </option>
          {projects.data?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Card>

      {projectId && (
        <Card>
          {running ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-anthracite/60">{CATEGORY_LABELS[running.category]}</p>
                <p className="text-2xl font-semibold flex items-center gap-2">
                  <Timer size={20} aria-hidden="true" />
                  {formatDurationMinutes(computeDurationMinutes(running))}
                </p>
              </div>
              <Button variant="danger" onClick={() => stop.mutate({ id: running.id, projectId })}>
                Arrêter
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <select
                  aria-label="Catégorie"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TimeEntryCategory)}
                  className="flex-1 rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} />
                  Facturable
                </label>
              </div>
              <Button onClick={() => start.mutate({ projectId, category, billable })}>Démarrer le chronomètre</Button>
            </div>
          )}
        </Card>
      )}

      {projectId && (entries.data?.length ?? 0) > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Historique</h2>
            <span className="text-sm text-anthracite/60">Total : {formatDurationMinutes(totalMinutes)}</span>
          </div>
          <ul className="divide-y divide-anthracite/10">
            {entries.data?.map((entry) => (
              <li key={entry.id} className="py-2 flex items-center justify-between text-sm">
                <span>
                  {CATEGORY_LABELS[entry.category]} {entry.billable ? '' : '(non facturable)'}
                </span>
                <span className="text-anthracite/60">
                  {entry.endedAt ? formatDurationMinutes(computeDurationMinutes(entry)) : 'en cours'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

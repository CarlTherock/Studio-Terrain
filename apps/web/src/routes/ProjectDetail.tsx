import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import { computeDurationMinutes } from '@studio-terrain/domain';
import { Card } from '@studio-terrain/ui';
import {
  useEnsureDemoPlan,
  useObservations,
  usePlans,
  useProject,
  useTasks,
  useTimeEntries,
  useZones,
} from '../hooks/queries';
import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from '../constants/labels';
import { downloadCsv, toCsv } from '../lib/csv';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = useProject(projectId);
  const zones = useZones(projectId);
  const plans = usePlans(projectId);
  const observations = useObservations(projectId);
  const tasks = useTasks(projectId);
  const timeEntries = useTimeEntries(projectId);
  const ensurePlan = useEnsureDemoPlan(projectId);

  function handleExportCsv() {
    if (!project.data) return;
    const csv = toCsv(
      ['Type', 'Détail', 'Statut', 'Date'],
      [
        ...(observations.data ?? []).map((o) => ['Observation', o.note || '(sans note)', '', o.createdAt]),
        ...(tasks.data ?? []).map((t) => ['Tâche', t.title, TASK_STATUS_LABELS[t.status] ?? t.status, t.createdAt]),
        ...(timeEntries.data ?? []).map((e) => [
          'Temps',
          `${e.category}${e.billable ? '' : ' (non facturable)'}`,
          e.endedAt ? `${computeDurationMinutes(e)} min` : 'en cours',
          e.startedAt,
        ]),
      ],
    );
    downloadCsv(`${project.data.name}.csv`, csv);
  }

  const ensurePlanMutate = ensurePlan.mutate;
  useEffect(() => {
    if (projectId && plans.data && plans.data.length === 0) {
      ensurePlanMutate();
    }
  }, [projectId, plans.data, ensurePlanMutate]);

  if (!project.data) {
    return <p className="text-sm text-anthracite/60">Chargement du projet…</p>;
  }

  const plan = plans.data?.[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{project.data.name}</h1>
          <p className="text-sm text-anthracite/60 uppercase tracking-wide">
            {PROJECT_STATUS_LABELS[project.data.status] ?? project.data.status}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 text-sm text-terracotta-text underline underline-offset-2"
        >
          <FileDown size={16} aria-hidden="true" />
          Exporter (CSV)
        </button>
      </div>

      <Card>
        <h2 className="font-semibold mb-2">Zones</h2>
        <ul className="flex flex-wrap gap-2">
          {zones.data?.map((zone) => (
            <li key={zone.id} className="rounded-full bg-anthracite/5 px-3 py-1 text-sm">
              {zone.name}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Plan</h2>
        </div>
        {plan ? (
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/plans/${plan.id}`)}
            className="text-sm text-terracotta-text underline underline-offset-2"
          >
            Ouvrir le plan de démonstration
          </button>
        ) : (
          <p className="text-sm text-anthracite/60">Préparation du plan de démonstration…</p>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Observations récentes</h2>
          <Link
            to={`/observations/new?projectId=${projectId}`}
            className="text-sm text-terracotta-text underline underline-offset-2"
          >
            Nouvelle observation
          </Link>
        </div>
        {observations.data && observations.data.length === 0 && (
          <p className="text-sm text-anthracite/60">Aucune observation pour l'instant.</p>
        )}
        <ul className="divide-y divide-anthracite/10">
          {observations.data?.map((obs) => (
            <li key={obs.id} className="py-2 text-sm">
              {obs.note || '(sans note)'}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Tâches</h2>
          <Link
            to={`/tasks/new?projectId=${projectId}`}
            className="text-sm text-terracotta-text underline underline-offset-2"
          >
            Assigner une tâche
          </Link>
        </div>
        {tasks.data && tasks.data.length === 0 && (
          <p className="text-sm text-anthracite/60">Aucune tâche assignée.</p>
        )}
        <ul className="divide-y divide-anthracite/10">
          {tasks.data?.map((task) => (
            <li key={task.id} className="py-2 text-sm flex justify-between">
              <span>{task.title}</span>
              <span className="text-xs uppercase tracking-wide text-anthracite/50">
                {TASK_STATUS_LABELS[task.status] ?? task.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

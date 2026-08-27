import { Link } from 'react-router-dom';
import { Card } from '@studio-terrain/ui';
import { useTasks } from '../hooks/queries';
import { TASK_STATUS_LABELS } from '../constants/labels';

export function TasksList() {
  const tasks = useTasks();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Tâches</h1>
        <Link to="/tasks/new" className="text-sm text-terracotta-text underline underline-offset-2">
          Nouvelle tâche
        </Link>
      </div>
      <Card>
        {tasks.data && tasks.data.length === 0 && (
          <p className="text-sm text-anthracite/60">Aucune tâche pour l'instant.</p>
        )}
        <ul className="divide-y divide-anthracite/10">
          {tasks.data?.map((task) => (
            <li key={task.id} className="py-3 flex items-center justify-between">
              <span className="font-medium">{task.title}</span>
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

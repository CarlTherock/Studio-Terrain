import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card } from '@studio-terrain/ui';
import { useCreateTask, useProjects } from '../hooks/queries';

export function TaskNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projects = useProjects();
  const createTask = useCreateTask();

  const [projectId, setProjectId] = useState(searchParams.get('projectId') ?? '');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!projectId || !title.trim()) return;
    await createTask.mutateAsync({
      projectId,
      title: title.trim(),
      assigneeId: assignee.trim() || undefined,
      dueDate: dueDate || undefined,
    });
    navigate(`/projects/${projectId}`);
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Assigner une tâche</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-project" className="block text-sm font-medium mb-1">
              Projet
            </label>
            <select
              id="task-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
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
          </div>
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium mb-1">
              Titre
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="Vérifier la position électrique"
            />
          </div>
          <div>
            <label htmlFor="task-assignee" className="block text-sm font-medium mb-1">
              Intervenant assigné
            </label>
            <input
              id="task-assignee"
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="Électricité ABC"
            />
          </div>
          <div>
            <label htmlFor="task-due" className="block text-sm font-medium mb-1">
              Échéance
            </label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <Button type="submit" disabled={createTask.isPending}>
            Assigner
          </Button>
        </form>
      </Card>
    </div>
  );
}

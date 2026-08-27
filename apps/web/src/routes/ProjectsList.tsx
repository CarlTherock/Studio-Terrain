import { Link } from 'react-router-dom';
import { Card } from '@studio-terrain/ui';
import { useProjects } from '../hooks/queries';
import { PROJECT_STATUS_LABELS } from '../constants/labels';

export function ProjectsList() {
  const projects = useProjects();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Projets</h1>
        <Link to="/projects/new" className="text-sm text-terracotta-text underline underline-offset-2">
          Nouveau projet
        </Link>
      </div>
      <Card>
        {projects.data && projects.data.length === 0 && (
          <p className="text-sm text-anthracite/60">
            Aucun projet. Créez d'abord un client, puis un projet.
          </p>
        )}
        <ul className="divide-y divide-anthracite/10">
          {projects.data?.map((project) => (
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
      </Card>
    </div>
  );
}

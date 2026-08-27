import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '@studio-terrain/ui';
import { useClients, useCreateProject } from '../hooks/queries';

export function ProjectNew() {
  const navigate = useNavigate();
  const clients = useClients();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [zoneName, setZoneName] = useState('Cuisine');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !clientId || !zoneName.trim()) return;
    const { project } = await createProject.mutateAsync({ name: name.trim(), clientId, zoneName: zoneName.trim() });
    navigate(`/projects/${project.id}`);
  }

  if (clients.data && clients.data.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <p className="text-sm text-anthracite/70">
            Il faut d'abord un client avant de créer un projet.{' '}
            <Link to="/clients/new" className="text-terracotta-text underline underline-offset-2">
              Créer un client
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-serif text-2xl font-semibold mb-4">Nouveau projet</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-client" className="block text-sm font-medium mb-1">
              Client
            </label>
            <select
              id="project-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              <option value="" disabled>
                Sélectionner un client
              </option>
              {clients.data?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium mb-1">
              Nom du projet
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="Rénovation cuisine"
            />
          </div>
          <div>
            <label htmlFor="project-zone" className="block text-sm font-medium mb-1">
              Première zone
            </label>
            <input
              id="project-zone"
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              required
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <Button type="submit" disabled={createProject.isPending}>
            Créer le projet
          </Button>
        </form>
      </Card>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { Card } from '@studio-terrain/ui';
import { useClients, useObservations, useProjects } from '../hooks/queries';

export function Search() {
  const [query, setQuery] = useState('');
  const clients = useClients();
  const projects = useProjects();
  const observations = useObservations(projects.data?.[0]?.id);

  const normalized = query.trim().toLowerCase();

  const matchingClients = useMemo(
    () => (normalized ? (clients.data ?? []).filter((c) => c.name.toLowerCase().includes(normalized)) : []),
    [clients.data, normalized],
  );
  const matchingProjects = useMemo(
    () => (normalized ? (projects.data ?? []).filter((p) => p.name.toLowerCase().includes(normalized)) : []),
    [projects.data, normalized],
  );
  const matchingObservations = useMemo(
    () => (normalized ? (observations.data ?? []).filter((o) => o.note.toLowerCase().includes(normalized)) : []),
    [observations.data, normalized],
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Recherche</h1>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-anthracite/40" size={18} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Client, projet, observation…"
          aria-label="Rechercher"
          className="w-full rounded-control border border-anthracite/20 pl-10 pr-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
        />
      </div>

      {normalized && (
        <div className="space-y-3">
          {matchingClients.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold mb-2">Clients</h2>
              <ul className="text-sm space-y-1">
                {matchingClients.map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </Card>
          )}
          {matchingProjects.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold mb-2">Projets</h2>
              <ul className="text-sm space-y-1">
                {matchingProjects.map((p) => (
                  <li key={p.id}>
                    <Link to={`/projects/${p.id}`} className="hover:text-terracotta-text">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {matchingObservations.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold mb-2">Observations</h2>
              <ul className="text-sm space-y-1">
                {matchingObservations.map((o) => (
                  <li key={o.id}>{o.note}</li>
                ))}
              </ul>
            </Card>
          )}
          {matchingClients.length + matchingProjects.length + matchingObservations.length === 0 && (
            <p className="text-sm text-anthracite/60">Aucun résultat.</p>
          )}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Card } from '@studio-terrain/ui';
import { useClients } from '../hooks/queries';

export function ClientsList() {
  const clients = useClients();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Clients</h1>
        <Link to="/clients/new" className="text-sm text-terracotta-text underline underline-offset-2">
          Nouveau client
        </Link>
      </div>
      <Link
        to="/sharepoint-lists"
        className="inline-block text-xs text-anthracite/50 underline underline-offset-2"
      >
        Aperçu des listes SharePoint (Clients/Projets)
      </Link>
      <Card>
        {clients.isLoading && <p className="text-sm text-anthracite/60">Chargement…</p>}
        {clients.data && clients.data.length === 0 && (
          <p className="text-sm text-anthracite/60">Aucun client. Créez-en un pour commencer.</p>
        )}
        <ul className="divide-y divide-anthracite/10">
          {clients.data?.map((client) => (
            <li key={client.id} className="py-3 font-medium">
              {client.name}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

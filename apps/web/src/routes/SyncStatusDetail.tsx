import { useLiveQuery } from 'dexie-react-hooks';
import { resolveConflict } from '@studio-terrain/sync';
import { Button, Card, StatusPill } from '@studio-terrain/ui';
import { useApiClient } from '../context/ApiClientProvider';
import { useSyncStatus } from '../hooks/useSyncStatus';

const ENTITY_LABELS: Record<string, string> = {
  client: 'Client',
  contact: 'Contact',
  project: 'Projet',
  zone: 'Zone',
  plan: 'Plan',
  observation: 'Observation',
  photo: 'Photo',
  task: 'Tâche',
};

export function SyncStatusDetail() {
  const { db } = useApiClient();
  const sync = useSyncStatus();
  const operations = useLiveQuery(() => db.syncQueue.orderBy('localSeq').reverse().toArray(), [db], []);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl font-semibold">Synchronisation</h1>
        <div className="flex items-center gap-2">
          <StatusPill status={sync.label} pendingCount={sync.pendingCount} />
          <Button variant="secondary" onClick={() => sync.sync()} disabled={sync.syncing}>
            {sync.syncing ? 'Synchronisation…' : 'Synchroniser'}
          </Button>
        </div>
      </div>

      <Card>
        {(!operations || operations.length === 0) && (
          <p className="text-sm text-anthracite/60">Aucune opération de synchronisation.</p>
        )}
        <ul className="divide-y divide-anthracite/10">
          {operations?.map((op) => (
            <li key={op.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {ENTITY_LABELS[op.entityType] ?? op.entityType} — {op.opType}
                </p>
                <p className="text-xs text-anthracite/50">{op.status}</p>
              </div>
              {op.status === 'conflict' && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => resolveConflict(db, op.id, 'keep_local')}
                    className="text-xs px-3 min-h-[36px]"
                  >
                    Garder ma version
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => resolveConflict(db, op.id, 'keep_server')}
                    className="text-xs px-3 min-h-[36px]"
                  >
                    Garder le serveur
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

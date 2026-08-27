import { useLiveQuery } from 'dexie-react-hooks';
import { getSyncStatusSummary, processSyncQueue, type SyncStatusSummary } from '@studio-terrain/sync';
import { useApiClient } from '../context/ApiClientProvider';
import { useCallback, useState } from 'react';

export function useSyncStatus(): SyncStatusSummary & { syncing: boolean; sync: () => Promise<void> } {
  const { db } = useApiClient();
  const [syncing, setSyncing] = useState(false);

  const summary = useLiveQuery(() => getSyncStatusSummary(db), [db], {
    pendingCount: 0,
    conflictCount: 0,
    label: 'synchronise' as const,
  });

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await processSyncQueue(db);
    } finally {
      setSyncing(false);
    }
  }, [db]);

  return { ...(summary ?? { pendingCount: 0, conflictCount: 0, label: 'synchronise' }), syncing, sync };
}

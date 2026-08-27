import { requiresManualResolution } from '@studio-terrain/domain';
import type { StudioTerrainDB } from './db';

export interface SyncEngineOptions {
  /** Simulated network delay range in ms. */
  minDelayMs?: number;
  maxDelayMs?: number;
  /** Entity ids to force into a conflict outcome (demo/test hook). */
  forceConflictIds?: readonly string[];
  /** Entity ids to force into a transient failure outcome (demo/test hook). */
  forceFailureIds?: readonly string[];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Simulated sync: processes pending SyncOperations in localSeq order,
 * pretending to talk to a server. No real network call is ever made.
 */
export async function processSyncQueue(
  db: StudioTerrainDB,
  options: SyncEngineOptions = {},
): Promise<{ synced: number; conflicts: number; failed: number }> {
  const { minDelayMs = 300, maxDelayMs = 1200, forceConflictIds = [], forceFailureIds = [] } = options;

  const pending = await db.syncQueue.where('status').equals('pending').sortBy('localSeq');

  let synced = 0;
  let conflicts = 0;
  let failed = 0;

  for (const op of pending) {
    await delay(randomDelay(minDelayMs, maxDelayMs));

    if (forceFailureIds.includes(op.entityId)) {
      failed += 1;
      continue;
    }

    const changedFields =
      op.payload && typeof op.payload === 'object' ? Object.keys(op.payload as Record<string, unknown>) : [];
    const isForcedConflict = forceConflictIds.includes(op.entityId);
    const isRealConflict = op.opType === 'update' && requiresManualResolution(op.entityType, changedFields);

    if (isForcedConflict || isRealConflict) {
      await db.syncQueue.update(op.id, { status: 'conflict', updatedAt: new Date().toISOString() });
      conflicts += 1;
      continue;
    }

    await db.syncQueue.update(op.id, { status: 'synced', updatedAt: new Date().toISOString() });
    synced += 1;
  }

  return { synced, conflicts, failed };
}

export async function resolveConflict(
  db: StudioTerrainDB,
  syncOpId: string,
  resolution: 'keep_local' | 'keep_server',
): Promise<void> {
  // In this simulated engine "keep_server" and "keep_local" both just clear
  // the conflict flag locally, since there is no real server state to pull.
  await db.syncQueue.update(syncOpId, {
    status: 'synced',
    updatedAt: new Date().toISOString(),
    payload: { resolution },
  });
}

export interface SyncStatusSummary {
  pendingCount: number;
  conflictCount: number;
  label: 'synchronise' | 'en_attente' | 'conflit';
}

export async function getSyncStatusSummary(db: StudioTerrainDB): Promise<SyncStatusSummary> {
  const [pendingCount, conflictCount] = await Promise.all([
    db.syncQueue.where('status').equals('pending').count(),
    db.syncQueue.where('status').equals('conflict').count(),
  ]);

  const label = conflictCount > 0 ? 'conflit' : pendingCount > 0 ? 'en_attente' : 'synchronise';

  return { pendingCount, conflictCount, label };
}

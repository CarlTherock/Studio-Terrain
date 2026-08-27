import { v4 as uuid } from 'uuid';
import type { Table } from 'dexie';
import type { BaseEntity } from '@studio-terrain/domain';
import type { ApiClient, EntityApi } from './ApiClient';
import type { StudioTerrainDB } from './db';

function nowIso(): string {
  return new Date().toISOString();
}

let syncSeq = 0;

async function enqueueSyncOp(
  db: StudioTerrainDB,
  entityType: string,
  entityId: string,
  opType: 'create' | 'update' | 'delete',
  payload: unknown,
): Promise<void> {
  syncSeq += 1;
  await db.syncQueue.put({
    id: uuid(),
    entityType,
    entityId,
    opType,
    payload,
    status: 'pending',
    localSeq: syncSeq,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    version: 1,
  });
}

function createEntityApi<T extends BaseEntity>(
  db: StudioTerrainDB,
  table: Table<T, string>,
  entityType: string,
): EntityApi<T> {
  return {
    async list(filter) {
      const all = await table.toArray();
      return all.filter((item) => {
        if (item.deletedAt) return false;
        if (!filter) return true;
        return Object.entries(filter).every(
          ([key, value]) => (item as Record<string, unknown>)[key] === value,
        );
      });
    },
    async get(id) {
      const item = await table.get(id);
      return item && !item.deletedAt ? item : undefined;
    },
    async create(input) {
      const entity = {
        ...input,
        id: uuid(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        deletedAt: null,
        version: 1,
      } as T;
      await table.put(entity);
      await enqueueSyncOp(db, entityType, entity.id, 'create', entity);
      return entity;
    },
    async update(id, patch) {
      const existing = await table.get(id);
      if (!existing) {
        throw new Error(`${entityType} ${id} not found`);
      }
      const updated: T = { ...existing, ...patch, updatedAt: nowIso() };
      await table.put(updated);
      await enqueueSyncOp(db, entityType, id, 'update', patch);
      return updated;
    },
    async remove(id) {
      const existing = await table.get(id);
      if (!existing) return;
      const softDeleted: T = { ...existing, deletedAt: nowIso(), updatedAt: nowIso() };
      await table.put(softDeleted);
      await enqueueSyncOp(db, entityType, id, 'delete', null);
    },
  };
}

export function createLocalApiAdapter(db: StudioTerrainDB): ApiClient {
  return {
    clients: createEntityApi(db, db.clients, 'client'),
    contacts: createEntityApi(db, db.contacts, 'contact'),
    projects: createEntityApi(db, db.projects, 'project'),
    zones: createEntityApi(db, db.zones, 'zone'),
    plans: createEntityApi(db, db.plans, 'plan'),
    observations: createEntityApi(db, db.observations, 'observation'),
    photos: createEntityApi(db, db.photos, 'photo'),
    tasks: createEntityApi(db, db.tasks, 'task'),
  };
}

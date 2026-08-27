import { beforeEach, describe, expect, it } from 'vitest';
import { createDb, type StudioTerrainDB } from './db';
import { createLocalApiAdapter } from './LocalApiAdapter';
import type { ApiClient } from './ApiClient';

describe('LocalApiAdapter', () => {
  let db: StudioTerrainDB;
  let api: ApiClient;

  beforeEach(() => {
    db = createDb(`test-db-${Math.random()}`);
    api = createLocalApiAdapter(db);
  });

  it('creates an entity and assigns id/timestamps/version', async () => {
    const client = await api.clients.create({ orgId: 'org-1', name: 'Résidence Tremblay', contactIds: [] });
    expect(client.id).toBeTruthy();
    expect(client.version).toBe(1);
    expect(client.createdAt).toBeTruthy();
  });

  it('queues a sync operation on create', async () => {
    const client = await api.clients.create({ orgId: 'org-1', name: 'Client A', contactIds: [] });
    const ops = await db.syncQueue.toArray();
    expect(ops).toHaveLength(1);
    expect(ops[0]?.entityType).toBe('client');
    expect(ops[0]?.entityId).toBe(client.id);
    expect(ops[0]?.status).toBe('pending');
  });

  it('excludes soft-deleted entities from list/get', async () => {
    const client = await api.clients.create({ orgId: 'org-1', name: 'Client B', contactIds: [] });
    await api.clients.remove(client.id);

    expect(await api.clients.get(client.id)).toBeUndefined();
    expect(await api.clients.list()).toHaveLength(0);
  });

  it('writes a photo blob before it is queued for sync (no data loss on interruption)', async () => {
    const blob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
    const photo = await api.photos.create({ observationId: 'obs-1', blob });
    const stored = await db.photos.get(photo.id);
    expect(stored).toBeDefined();
    expect(stored?.blob).toBeInstanceOf(Blob);
    const ops = await db.syncQueue.where('entityId').equals(photo.id).toArray();
    expect(ops).toHaveLength(1);
  });

  it('filters list() results by provided fields', async () => {
    await api.projects.create({ orgId: 'org-1', clientId: 'c1', name: 'Projet A', status: 'planification' });
    await api.projects.create({ orgId: 'org-1', clientId: 'c2', name: 'Projet B', status: 'en_cours' });

    const filtered = await api.projects.list({ clientId: 'c1' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe('Projet A');
  });
});

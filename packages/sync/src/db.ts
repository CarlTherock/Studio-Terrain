import Dexie, { type Table } from 'dexie';
import type {
  Client,
  Contact,
  Observation,
  Photo,
  Plan,
  Project,
  SyncOperation,
  Task,
  TimeEntry,
  Zone,
} from '@studio-terrain/domain';

export class StudioTerrainDB extends Dexie {
  clients!: Table<Client, string>;
  contacts!: Table<Contact, string>;
  projects!: Table<Project, string>;
  zones!: Table<Zone, string>;
  plans!: Table<Plan, string>;
  observations!: Table<Observation, string>;
  photos!: Table<Photo, string>;
  tasks!: Table<Task, string>;
  timeEntries!: Table<TimeEntry, string>;
  syncQueue!: Table<SyncOperation, string>;

  constructor(name = 'studio-terrain') {
    super(name);
    this.version(1).stores({
      clients: 'id, orgId, deletedAt',
      contacts: 'id, clientId, deletedAt',
      projects: 'id, orgId, clientId, deletedAt',
      zones: 'id, projectId, phaseId, deletedAt',
      plans: 'id, projectId, zoneId, deletedAt',
      observations: 'id, projectId, zoneId, planId, deletedAt',
      photos: 'id, observationId, deletedAt',
      tasks: 'id, projectId, assigneeId, status, deletedAt',
      syncQueue: 'id, status, localSeq, entityType, entityId',
    });
    this.version(2).stores({
      timeEntries: 'id, projectId, deletedAt',
    });
  }
}

export function createDb(name?: string): StudioTerrainDB {
  return new StudioTerrainDB(name);
}

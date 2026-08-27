export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
}

export interface Organization extends BaseEntity {
  name: string;
}

export interface Role extends BaseEntity {
  orgId: string;
  name: string;
  permissions: string[];
}

export interface User extends BaseEntity {
  orgId: string;
  name: string;
  email: string;
  roleId: string;
}

export interface Client extends BaseEntity {
  orgId: string;
  name: string;
  contactIds: string[];
}

export interface Contact extends BaseEntity {
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
}

export type ProjectStatus = 'planification' | 'en_cours' | 'en_pause' | 'termine';

export interface Project extends BaseEntity {
  orgId: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  /** Stable OneDrive/SharePoint driveItem id — never matched by folder name alone (spec §9). */
  oneDriveFolderId?: string;
  oneDriveFolderName?: string;
  oneDriveWebUrl?: string;
}

export interface Phase extends BaseEntity {
  projectId: string;
  name: string;
  order: number;
}

export interface Zone extends BaseEntity {
  projectId: string;
  phaseId?: string;
  name: string;
}

export interface Plan extends BaseEntity {
  projectId: string;
  zoneId?: string;
  name: string;
  imageUrl: string;
}

export interface Annotation {
  id: string;
  type: 'fleche' | 'cercle' | 'rectangle' | 'texte' | 'mesure';
  x: number;
  y: number;
  label?: string;
}

export interface Photo extends BaseEntity {
  observationId: string;
  blob: Blob;
  annotations?: Annotation[];
}

export interface Observation extends BaseEntity {
  projectId: string;
  zoneId?: string;
  planId?: string;
  note: string;
  photoIds: string[];
  authorId?: string;
  markerX?: number;
  markerY?: number;
}

export type TaskStatus = 'a_traiter' | 'en_cours' | 'a_valider' | 'resolue' | 'rejetee';

export interface Task extends BaseEntity {
  projectId: string;
  observationId?: string;
  title: string;
  assigneeId?: string;
  status: TaskStatus;
  dueDate?: string;
}

export type TimeEntryCategory =
  | 'bureau'
  | 'trajet'
  | 'chantier'
  | 'reunion'
  | 'conception'
  | 'administration';

export interface TimeEntry extends BaseEntity {
  projectId: string;
  category: TimeEntryCategory;
  billable: boolean;
  startedAt: string;
  endedAt?: string;
  note?: string;
}

export type SyncOpType = 'create' | 'update' | 'delete';
export type SyncOpStatus = 'pending' | 'synced' | 'conflict' | 'error';

export interface SyncOperation extends BaseEntity {
  entityType: string;
  entityId: string;
  opType: SyncOpType;
  payload: unknown;
  status: SyncOpStatus;
  localSeq: number;
}

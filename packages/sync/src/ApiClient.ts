import type { BaseEntity } from '@studio-terrain/domain';
import type { Client, Contact, Observation, Photo, Plan, Project, Task, Zone } from '@studio-terrain/domain';

export interface EntityApi<T extends BaseEntity> {
  list(filter?: Partial<T>): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(input: Omit<T, keyof BaseEntity>): Promise<T>;
  update(id: string, patch: Partial<Omit<T, keyof BaseEntity>>): Promise<T>;
  remove(id: string): Promise<void>;
}

/**
 * Every entity in the app is accessed exclusively through this interface.
 * Today the only implementation is LocalApiAdapter (IndexedDB + simulated
 * sync queue). A future HttpApiAdapter implementing the same interface is
 * the only file that needs to change when a real backend exists.
 */
export interface ApiClient {
  clients: EntityApi<Client>;
  contacts: EntityApi<Contact>;
  projects: EntityApi<Project>;
  zones: EntityApi<Zone>;
  plans: EntityApi<Plan>;
  observations: EntityApi<Observation>;
  photos: EntityApi<Photo>;
  tasks: EntityApi<Task>;
}

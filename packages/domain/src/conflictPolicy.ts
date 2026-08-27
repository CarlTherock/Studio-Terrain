/**
 * Fields requiring manual conflict resolution (spec §8): status, approval,
 * signature, price, deadline, signed content. Everything else uses
 * last-write-wins. Keyed by entity type name (matches SyncOperation.entityType).
 */
const MANUAL_RESOLUTION_FIELDS: Record<string, readonly string[]> = {
  task: ['status', 'dueDate', 'assigneeId'],
  project: ['status'],
};

export function requiresManualResolution(entityType: string, changedFields: readonly string[]): boolean {
  const manualFields = MANUAL_RESOLUTION_FIELDS[entityType] ?? [];
  return changedFields.some((field) => manualFields.includes(field));
}

export type TaskStatusTransition = {
  from: string;
  to: string;
};

const ALLOWED_TASK_TRANSITIONS: Record<string, readonly string[]> = {
  a_traiter: ['en_cours', 'rejetee'],
  en_cours: ['a_valider', 'a_traiter', 'rejetee'],
  a_valider: ['resolue', 'en_cours'],
  resolue: [],
  rejetee: ['a_traiter'],
};

export function canTransitionTaskStatus(from: string, to: string): boolean {
  if (from === to) return true;
  return (ALLOWED_TASK_TRANSITIONS[from] ?? []).includes(to);
}

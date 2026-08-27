import type { TimeEntry } from './entities';

/** Minutes elapsed for a time entry; uses `now` as the end when still running. */
export function computeDurationMinutes(entry: Pick<TimeEntry, 'startedAt' | 'endedAt'>, now = new Date()): number {
  const start = new Date(entry.startedAt).getTime();
  const end = entry.endedAt ? new Date(entry.endedAt).getTime() : now.getTime();
  return Math.max(0, Math.round((end - start) / 60_000));
}

export function sumDurationMinutes(entries: readonly Pick<TimeEntry, 'startedAt' | 'endedAt'>[], now = new Date()): number {
  return entries.reduce((total, entry) => total + computeDurationMinutes(entry, now), 0);
}

export function formatDurationMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

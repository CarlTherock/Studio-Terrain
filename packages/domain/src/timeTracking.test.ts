import { describe, expect, it } from 'vitest';
import { computeDurationMinutes, formatDurationMinutes, sumDurationMinutes } from './timeTracking';

describe('computeDurationMinutes', () => {
  it('computes elapsed minutes for a finished entry', () => {
    const entry = { startedAt: '2026-08-27T09:00:00.000Z', endedAt: '2026-08-27T10:30:00.000Z' };
    expect(computeDurationMinutes(entry)).toBe(90);
  });

  it('uses now as the end for a running entry', () => {
    const now = new Date('2026-08-27T09:45:00.000Z');
    const entry = { startedAt: '2026-08-27T09:00:00.000Z' };
    expect(computeDurationMinutes(entry, now)).toBe(45);
  });

  it('never returns a negative duration', () => {
    const now = new Date('2026-08-27T08:00:00.000Z');
    const entry = { startedAt: '2026-08-27T09:00:00.000Z' };
    expect(computeDurationMinutes(entry, now)).toBe(0);
  });
});

describe('sumDurationMinutes', () => {
  it('sums multiple entries', () => {
    const entries = [
      { startedAt: '2026-08-27T09:00:00.000Z', endedAt: '2026-08-27T09:30:00.000Z' },
      { startedAt: '2026-08-27T10:00:00.000Z', endedAt: '2026-08-27T11:00:00.000Z' },
    ];
    expect(sumDurationMinutes(entries)).toBe(90);
  });
});

describe('formatDurationMinutes', () => {
  it('formats minutes only', () => {
    expect(formatDurationMinutes(45)).toBe('45 min');
  });
  it('formats whole hours', () => {
    expect(formatDurationMinutes(120)).toBe('2 h');
  });
  it('formats hours and minutes', () => {
    expect(formatDurationMinutes(90)).toBe('1 h 30 min');
  });
});

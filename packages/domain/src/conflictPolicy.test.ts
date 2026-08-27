import { describe, expect, it } from 'vitest';
import { canTransitionTaskStatus, requiresManualResolution } from './conflictPolicy';

describe('requiresManualResolution', () => {
  it('flags task status changes as requiring manual resolution', () => {
    expect(requiresManualResolution('task', ['status'])).toBe(true);
  });

  it('does not flag non-critical field changes', () => {
    expect(requiresManualResolution('task', ['title'])).toBe(false);
  });

  it('returns false for unknown entity types', () => {
    expect(requiresManualResolution('unknown', ['status'])).toBe(false);
  });
});

describe('canTransitionTaskStatus', () => {
  it('allows a valid forward transition', () => {
    expect(canTransitionTaskStatus('a_traiter', 'en_cours')).toBe(true);
  });

  it('rejects an invalid transition', () => {
    expect(canTransitionTaskStatus('a_traiter', 'resolue')).toBe(false);
  });

  it('allows a no-op transition to the same status', () => {
    expect(canTransitionTaskStatus('resolue', 'resolue')).toBe(true);
  });

  it('rejects any transition out of a terminal status', () => {
    expect(canTransitionTaskStatus('resolue', 'en_cours')).toBe(false);
  });
});

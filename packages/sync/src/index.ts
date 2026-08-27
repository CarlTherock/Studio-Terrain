export * from './db';
export * from './ApiClient';
export * from './LocalApiAdapter';
export * from './syncEngine';

import type { ApiClient } from './ApiClient';
import { createDb } from './db';
import { createLocalApiAdapter } from './LocalApiAdapter';

export type ApiClientMode = 'local';

export function createApiClient(mode: ApiClientMode = 'local'): ApiClient {
  if (mode === 'local') {
    return createLocalApiAdapter(createDb());
  }
  throw new Error(`Unsupported ApiClient mode: ${mode as string}`);
}

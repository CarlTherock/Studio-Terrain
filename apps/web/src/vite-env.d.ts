/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import type { ApiClient } from '@studio-terrain/sync';

declare global {
  interface Window {
    /** Test-only seam for Playwright to seed local data. See ApiClientProvider. */
    __studioTerrainApi?: ApiClient;
  }
}

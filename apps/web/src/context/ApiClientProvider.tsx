import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createDb, createLocalApiAdapter, type ApiClient, type StudioTerrainDB } from '@studio-terrain/sync';

interface ApiClientContextValue {
  api: ApiClient;
  db: StudioTerrainDB;
}

const ApiClientContext = createContext<ApiClientContextValue | undefined>(undefined);

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, refetchOnWindowFocus: false } },
});

export function ApiClientProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ApiClientContextValue>(() => {
    const db = createDb();
    const api = createLocalApiAdapter(db);
    // Test-only seam: lets Playwright seed local data (e.g. a client) that
    // no longer has a manual-entry UI path (clients now come exclusively
    // from the Tally intake forms). Not used by any app UI code.
    window.__studioTerrainApi = api;
    return { api, db };
  }, []);

  return (
    <ApiClientContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): ApiClientContextValue {
  const ctx = useContext(ApiClientContext);
  if (!ctx) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return ctx;
}

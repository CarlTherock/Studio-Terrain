import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { ApiClientProvider } from './context/ApiClientProvider';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found');
}

createRoot(rootEl).render(
  <StrictMode>
    <ApiClientProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </HashRouter>
    </ApiClientProvider>
  </StrictMode>,
);

// Hide the static splash (index.html) once the app has painted, with a
// short minimum so it doesn't just flash on fast connections.
const splash = document.getElementById('app-splash');
if (splash) {
  const MIN_VISIBLE_MS = 500;
  const start = performance.now();
  requestAnimationFrame(() => {
    const elapsed = performance.now() - start;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      splash.classList.add('app-splash-hidden');
      setTimeout(() => splash.remove(), 350);
    }, remaining);
  });
}

import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { ApiClientProvider } from './context/ApiClientProvider';

function renderApp() {
  return render(
    <ApiClientProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </HashRouter>
    </ApiClientProvider>,
  );
}

describe('App', () => {
  it('renders the cockpit dashboard by default', async () => {
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Cockpit' })).toBeInTheDocument();
  });

  it('shows the synchronized status when the sync queue is empty', async () => {
    renderApp();
    expect(await screen.findByText('Synchronisé')).toBeInTheDocument();
  });
});

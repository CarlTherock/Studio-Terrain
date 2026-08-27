import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { Dashboard } from './routes/Dashboard';
import { ClientsList } from './routes/ClientsList';
import { ClientNew } from './routes/ClientNew';
import { ProjectsList } from './routes/ProjectsList';
import { ProjectNew } from './routes/ProjectNew';
import { ProjectDetail } from './routes/ProjectDetail';
import { PlanViewer } from './routes/PlanViewer';
import { ObservationNew } from './routes/ObservationNew';
import { TasksList } from './routes/TasksList';
import { TaskNew } from './routes/TaskNew';
import { Search } from './routes/Search';
import { SyncStatusDetail } from './routes/SyncStatusDetail';
import { TimeTracking } from './routes/TimeTracking';

// Lazy-loaded: pulls in @azure/msal-browser, kept out of the initial bundle.
const Documents = lazy(() => import('./routes/Documents').then((m) => ({ default: m.Documents })));

export function App() {
  return (
    <AppShell>
      <Suspense fallback={<p className="text-sm text-anthracite/60">Chargement…</p>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<ClientsList />} />
        <Route path="/clients/new" element={<ClientNew />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/new" element={<ProjectNew />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/projects/:projectId/plans/:planId" element={<PlanViewer />} />
        <Route path="/observations/new" element={<ObservationNew />} />
        <Route path="/tasks" element={<TasksList />} />
        <Route path="/tasks/new" element={<TaskNew />} />
        <Route path="/search" element={<Search />} />
        <Route path="/sync" element={<SyncStatusDetail />} />
        <Route path="/time" element={<TimeTracking />} />
        <Route path="/documents" element={<Documents />} />
      </Routes>
      </Suspense>
    </AppShell>
  );
}

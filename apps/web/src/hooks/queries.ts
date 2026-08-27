import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Client,
  Observation,
  Photo,
  Plan,
  Project,
  Task,
  TimeEntry,
  TimeEntryCategory,
  Zone,
} from '@studio-terrain/domain';
import { useApiClient } from '../context/ApiClientProvider';

const DEMO_ORG_ID = 'org-demo';

export function useClients() {
  const { api } = useApiClient();
  return useQuery({ queryKey: ['clients'], queryFn: () => api.clients.list() });
}

export function useCreateClient() {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string }) =>
      api.clients.create({ orgId: DEMO_ORG_ID, name: input.name, contactIds: [] } as Omit<
        Client,
        'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'
      >),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useProjects() {
  const { api } = useApiClient();
  return useQuery({ queryKey: ['projects'], queryFn: () => api.projects.list() });
}

export function useProject(projectId: string | undefined) {
  const { api } = useApiClient();
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => api.projects.get(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useLinkProjectOneDriveFolder() {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { projectId: string; folderId: string; folderName: string; webUrl: string }) =>
      api.projects.update(input.projectId, {
        oneDriveFolderId: input.folderId,
        oneDriveFolderName: input.folderName,
        oneDriveWebUrl: input.webUrl,
      }),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['projects', project.id] });
    },
  });
}

export function useCreateProject() {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; clientId: string; zoneName: string }) => {
      const project = await api.projects.create({
        orgId: DEMO_ORG_ID,
        clientId: input.clientId,
        name: input.name,
        status: 'planification',
      } as Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>);
      const zone = await api.zones.create({
        projectId: project.id,
        name: input.zoneName,
      } as Omit<Zone, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>);
      return { project, zone };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useZones(projectId: string | undefined) {
  const { api } = useApiClient();
  return useQuery({
    queryKey: ['zones', projectId],
    queryFn: () => api.zones.list({ projectId } as Partial<Zone>),
    enabled: Boolean(projectId),
  });
}

export function usePlans(projectId: string | undefined) {
  const { api } = useApiClient();
  return useQuery({
    queryKey: ['plans', projectId],
    queryFn: () => api.plans.list({ projectId } as Partial<Plan>),
    enabled: Boolean(projectId),
  });
}

export function usePlan(planId: string | undefined) {
  const { api } = useApiClient();
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: () => api.plans.get(planId as string),
    enabled: Boolean(planId),
  });
}

export function useEnsureDemoPlan(projectId: string | undefined) {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error('projectId requis');
      const existing = await api.plans.list({ projectId } as Partial<Plan>);
      if (existing.length > 0) return existing[0] as Plan;
      return api.plans.create({
        projectId,
        name: 'Plan de démonstration',
        imageUrl: 'demo-plan.svg',
      } as Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans', projectId] }),
  });
}

export function useObservations(projectId: string | undefined) {
  const { api } = useApiClient();
  return useQuery({
    queryKey: ['observations', projectId],
    queryFn: () => api.observations.list({ projectId } as Partial<Observation>),
    enabled: Boolean(projectId),
  });
}

export function useCreateObservation() {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      projectId: string;
      zoneId?: string;
      planId?: string;
      note: string;
      markerX?: number;
      markerY?: number;
      photoBlob?: Blob;
    }) => {
      const photoIds: string[] = [];
      if (input.photoBlob) {
        const photo = await api.photos.create({
          observationId: 'pending',
          blob: input.photoBlob,
        } as Omit<Photo, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>);
        photoIds.push(photo.id);
      }
      const observation = await api.observations.create({
        projectId: input.projectId,
        zoneId: input.zoneId,
        planId: input.planId,
        note: input.note,
        photoIds,
        markerX: input.markerX,
        markerY: input.markerY,
      } as Omit<Observation, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>);
      for (const photoId of photoIds) {
        await api.photos.update(photoId, { observationId: observation.id });
      }
      return observation;
    },
    onSuccess: (obs) => {
      qc.invalidateQueries({ queryKey: ['observations', obs.projectId] });
    },
  });
}

export function useTasks(projectId?: string) {
  const { api } = useApiClient();
  return useQuery({
    queryKey: ['tasks', projectId ?? 'all'],
    queryFn: () => api.tasks.list(projectId ? ({ projectId } as Partial<Task>) : undefined),
  });
}

export function useCreateTask() {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      projectId: string;
      title: string;
      assigneeId?: string;
      dueDate?: string;
      observationId?: string;
    }) =>
      api.tasks.create({
        projectId: input.projectId,
        title: input.title,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate,
        observationId: input.observationId,
        status: 'a_traiter',
      } as Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useTimeEntries(projectId?: string) {
  const { api } = useApiClient();
  return useQuery({
    queryKey: ['timeEntries', projectId ?? 'all'],
    queryFn: () => api.timeEntries.list(projectId ? ({ projectId } as Partial<TimeEntry>) : undefined),
  });
}

export function useRunningTimeEntry(projectId: string | undefined) {
  const entries = useTimeEntries(projectId);
  const running = entries.data?.find((entry) => !entry.endedAt);
  return { running, isLoading: entries.isLoading };
}

export function useStartTimeEntry() {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { projectId: string; category: TimeEntryCategory; billable: boolean }) =>
      api.timeEntries.create({
        projectId: input.projectId,
        category: input.category,
        billable: input.billable,
        startedAt: new Date().toISOString(),
      } as Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>),
    onSuccess: (entry) => qc.invalidateQueries({ queryKey: ['timeEntries', entry.projectId] }),
  });
}

export function useStopTimeEntry() {
  const { api } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; projectId: string }) =>
      api.timeEntries.update(input.id, { endedAt: new Date().toISOString() }),
    onSuccess: (_entry, input) => qc.invalidateQueries({ queryKey: ['timeEntries', input.projectId] }),
  });
}

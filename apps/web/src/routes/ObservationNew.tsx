import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button, Card } from '@studio-terrain/ui';
import { useCreateObservation, useProjects, useZones } from '../hooks/queries';

export function ObservationNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectIdFromUrl = searchParams.get('projectId') ?? '';
  const planId = searchParams.get('planId') || undefined;
  const markerX = searchParams.get('markerX');
  const markerY = searchParams.get('markerY');

  const projects = useProjects();
  const [projectId, setProjectId] = useState(projectIdFromUrl);
  const zones = useZones(projectId || undefined);
  const [zoneId, setZoneId] = useState('');
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const createObservation = useCreateObservation();

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhotoFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!projectId) return;
    await createObservation.mutateAsync({
      projectId,
      zoneId: zoneId || undefined,
      planId,
      note: note.trim(),
      markerX: markerX ? Number(markerX) : undefined,
      markerY: markerY ? Number(markerY) : undefined,
      photoBlob: photoFile ?? undefined,
    });
    navigate(`/projects/${projectId}`);
  }

  if (!projectId) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="font-serif text-2xl font-semibold">Nouvelle observation</h1>
        <Card>
          <label htmlFor="obs-project" className="block text-sm font-medium mb-1">
            Choisir un projet
          </label>
          <select
            id="obs-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            <option value="" disabled>
              Sélectionner un projet
            </option>
            {projects.data?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Nouvelle observation</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {zones.data && zones.data.length > 0 && (
            <div>
              <label htmlFor="obs-zone" className="block text-sm font-medium mb-1">
                Zone
              </label>
              <select
                id="obs-zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="">Sans zone spécifique</option>
                {zones.data.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="obs-photo" className="flex items-center gap-2 text-sm font-medium mb-1">
              <Camera size={18} aria-hidden="true" /> Photo
            </label>
            <input
              id="obs-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label htmlFor="obs-note" className="block text-sm font-medium mb-1">
              Note
            </label>
            <textarea
              id="obs-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="Décrire l'observation…"
            />
          </div>

          <Button type="submit" disabled={createObservation.isPending}>
            Enregistrer
          </Button>
        </form>
      </Card>
    </div>
  );
}

import { useRef, useState, type MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button, Card } from '@studio-terrain/ui';
import { usePlan } from '../hooks/queries';

export function PlanViewer() {
  const { projectId, planId } = useParams<{ projectId: string; planId: string }>();
  const navigate = useNavigate();
  const plan = usePlan(planId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setMarker({ x, y });
  }

  function handleContinue() {
    if (!marker || !projectId) return;
    const params = new URLSearchParams({
      projectId,
      planId: planId ?? '',
      markerX: marker.x.toFixed(4),
      markerY: marker.y.toFixed(4),
    });
    navigate(`/observations/new?${params.toString()}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="font-serif text-2xl font-semibold">{plan.data?.name ?? 'Plan'}</h1>
      <p className="text-sm text-anthracite/60">Touchez le plan pour déposer un marqueur d'observation.</p>
      <Card className="p-0 overflow-hidden">
        <div ref={containerRef} onClick={handleClick} className="relative cursor-crosshair select-none">
          <img src="demo-plan.svg" alt="Plan de démonstration du projet" className="w-full h-auto block" draggable={false} />
          {marker && (
            <MapPin
              className="absolute text-terracotta-text -translate-x-1/2 -translate-y-full drop-shadow"
              size={32}
              style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
              aria-label="Marqueur d'observation posé"
            />
          )}
        </div>
      </Card>
      <Button onClick={handleContinue} disabled={!marker}>
        Créer une observation ici
      </Button>
    </div>
  );
}

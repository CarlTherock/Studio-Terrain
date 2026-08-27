import { ExternalLink } from 'lucide-react';
import { Card } from '@studio-terrain/ui';

export function ClientNew() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-serif text-2xl font-semibold mb-4">Nouveau client</h1>
      <p className="text-sm text-anthracite/60 mb-4">
        L'intégration d'un client se fait uniquement par un des formulaires ci-dessous — pas de saisie manuelle.
      </p>

      <Card>
        <h2 className="text-sm font-semibold mb-2">Formulaires clients</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="https://tally.so/r/A7Q4a0"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-terracotta-text underline underline-offset-2"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Questionnaire de design (nouveau client)
            </a>
          </li>
          <li>
            <a
              href="https://tally.so/r/QK9EVG"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-terracotta-text underline underline-offset-2"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Migration client existant
            </a>
          </li>
        </ul>
        <p className="text-xs text-anthracite/50 mt-3">
          Les réponses ne sont pas encore importées automatiquement dans StudioTerrain — nécessite un backend
          (webhook Tally). En attendant, le client apparaîtra dans la liste une fois cette étape branchée.
        </p>
      </Card>
    </div>
  );
}

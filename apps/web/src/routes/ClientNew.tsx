import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@studio-terrain/ui';
import { useCreateClient } from '../hooks/queries';

export function ClientNew() {
  const navigate = useNavigate();
  const createClient = useCreateClient();
  const [name, setName] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await createClient.mutateAsync({ name: name.trim() });
    navigate('/clients');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-serif text-2xl font-semibold mb-4">Nouveau client</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="client-name" className="block text-sm font-medium mb-1">
              Nom du client
            </label>
            <input
              id="client-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
              placeholder="Résidence Tremblay"
            />
          </div>
          <Button type="submit" disabled={createClient.isPending}>
            Enregistrer
          </Button>
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold mb-2">Formulaires clients</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="https://tally.so/r/A7Q4a0"
              target="_blank"
              rel="noreferrer"
              className="text-terracotta-text underline underline-offset-2"
            >
              Questionnaire de design (nouveau client)
            </a>
          </li>
          <li>
            <a
              href="https://tally.so/r/QK9EVG"
              target="_blank"
              rel="noreferrer"
              className="text-terracotta-text underline underline-offset-2"
            >
              Migration client existant
            </a>
          </li>
        </ul>
        <p className="text-xs text-anthracite/50 mt-2">
          Les réponses ne sont pas encore importées automatiquement — nécessite un backend (webhook Tally).
        </p>
      </Card>
    </div>
  );
}

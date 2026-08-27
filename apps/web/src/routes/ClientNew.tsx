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
    </div>
  );
}

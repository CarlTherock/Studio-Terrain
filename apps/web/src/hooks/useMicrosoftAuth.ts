import { useCallback, useState } from 'react';
import { getAccessToken, getActiveAccount, signIn, signOut } from '@studio-terrain/integrations';

function getRedirectUri(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}`;
}

export function useMicrosoftAuth() {
  const redirectUri = getRedirectUri();
  const [account, setAccount] = useState(() => getActiveAccount());
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const acc = await signIn(redirectUri);
      setAccount(acc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion Microsoft échouée');
    } finally {
      setConnecting(false);
    }
  }, [redirectUri]);

  const disconnect = useCallback(() => {
    signOut(redirectUri);
    setAccount(undefined);
  }, [redirectUri]);

  const getToken = useCallback(() => getAccessToken(redirectUri), [redirectUri]);

  return { account, connecting, error, connect, disconnect, getToken };
}

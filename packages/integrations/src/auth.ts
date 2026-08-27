import { PublicClientApplication, type AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { createMsalConfig, GRAPH_SCOPES } from './msalConfig';

let msalInstance: PublicClientApplication | undefined;
let initPromise: Promise<void> | undefined;

async function getMsal(redirectUri: string): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(createMsalConfig(redirectUri));
  }
  if (!initPromise) {
    initPromise = msalInstance.initialize();
  }
  await initPromise;
  return msalInstance;
}

export function getActiveAccount(): AccountInfo | undefined {
  return msalInstance?.getAllAccounts()[0];
}

export async function signIn(redirectUri: string): Promise<AccountInfo> {
  const msal = await getMsal(redirectUri);
  // Always show Microsoft's account chooser — never silently reuse an
  // existing SSO session, so the user can pick or type a different account.
  const result = await msal.loginPopup({ scopes: [...GRAPH_SCOPES], prompt: 'select_account' });
  msal.setActiveAccount(result.account);
  return result.account;
}

export function signOut(redirectUri: string): void {
  msalInstance?.setActiveAccount(null);
  void getMsal(redirectUri).then((msal) => msal.logoutPopup());
}

export async function getAccessToken(redirectUri: string): Promise<string> {
  const msal = await getMsal(redirectUri);
  const account = msal.getAllAccounts()[0];
  if (!account) {
    throw new Error('Aucun compte Microsoft connecté — appelez signIn() d\'abord.');
  }
  try {
    const result = await msal.acquireTokenSilent({ scopes: [...GRAPH_SCOPES], account });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const result = await msal.acquireTokenPopup({ scopes: [...GRAPH_SCOPES], account });
      return result.accessToken;
    }
    throw error;
  }
}

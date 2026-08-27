import type { Configuration } from '@azure/msal-browser';

/**
 * Reuses the existing Entra ID app registration from
 * emilie-pepin-designer-interieur (a public client / SPA — PKCE, no secret).
 * clientId/tenantId are not confidential: they identify a public client,
 * the same way any OAuth client id is safe to ship in a browser bundle.
 * The redirect URI below must be added to that app registration's
 * "Single-page application" platform in Azure Portal.
 */
export const MICROSOFT_CONFIG = {
  clientId: '6cab6163-d4de-4a5a-a9f4-36f4058be920',
  tenantId: 'a8238caf-f2db-4be1-93a7-ce2789e11107',
  sharePointHost: 'emiliepepin.sharepoint.com',
  sharePointSiteName: 'EmiliePepinDesignerInterieur',
  oneDriveRoot: 'Emilie Pepin Designer Interieur/CLIENTS',
} as const;

/** Scopes StudioTerrain actually needs — a subset of what's already consented for this app. */
export const GRAPH_SCOPES = ['Sites.Read.All', 'Files.ReadWrite.All'] as const;

export function createMsalConfig(redirectUri: string): Configuration {
  return {
    auth: {
      clientId: MICROSOFT_CONFIG.clientId,
      authority: `https://login.microsoftonline.com/${MICROSOFT_CONFIG.tenantId}`,
      redirectUri,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
  };
}

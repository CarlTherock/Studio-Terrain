import { MICROSOFT_CONFIG } from './msalConfig';

export interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
  size?: number;
  lastModifiedDateTime?: string;
  isFolder: boolean;
}

async function graphFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Microsoft Graph ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

let cachedSiteId: string | undefined;

export async function getSiteId(accessToken: string): Promise<string> {
  if (cachedSiteId) return cachedSiteId;
  const site = await graphFetch<{ id: string }>(
    `/sites/${MICROSOFT_CONFIG.sharePointHost}:/sites/${MICROSOFT_CONFIG.sharePointSiteName}`,
    accessToken,
  );
  cachedSiteId = site.id;
  return site.id;
}

interface GraphDriveItemResponse {
  id: string;
  name: string;
  webUrl: string;
  size?: number;
  lastModifiedDateTime?: string;
  folder?: unknown;
}

function toDriveItem(raw: GraphDriveItemResponse): DriveItem {
  return {
    id: raw.id,
    name: raw.name,
    webUrl: raw.webUrl,
    size: raw.size,
    lastModifiedDateTime: raw.lastModifiedDateTime,
    isFolder: Boolean(raw.folder),
  };
}

/**
 * Lists children of a folder under the shared root (spec §9: association by
 * a stable path under the existing OneDrive/SharePoint structure — never
 * moved, never duplicated).
 */
export async function listFolder(accessToken: string, relativePath = ''): Promise<DriveItem[]> {
  const siteId = await getSiteId(accessToken);
  const path = [MICROSOFT_CONFIG.oneDriveRoot, relativePath].filter(Boolean).join('/');
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  const result = await graphFetch<{ value: GraphDriveItemResponse[] }>(
    `/sites/${siteId}/drive/root:/${encoded}:/children`,
    accessToken,
  );
  return result.value.map(toDriveItem);
}

/** Lists children by stable driveItem id — used once a project is linked to a folder. */
export async function listChildrenById(accessToken: string, itemId: string): Promise<DriveItem[]> {
  const siteId = await getSiteId(accessToken);
  const result = await graphFetch<{ value: GraphDriveItemResponse[] }>(
    `/sites/${siteId}/drive/items/${itemId}/children`,
    accessToken,
  );
  return result.value.map(toDriveItem);
}

const SIMPLE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024; // Graph's simple (non-session) upload limit.

/**
 * Uploads a file into an existing folder by its stable driveItem id — used
 * to send StudioTerrain content (photos, exports) into the client's real
 * OneDrive/SharePoint subfolders (e.g. "10_Photos"). Files over 4MB need a
 * resumable upload session, not implemented yet.
 */
export async function uploadFile(
  accessToken: string,
  folderId: string,
  filename: string,
  content: Blob,
): Promise<DriveItem> {
  if (content.size > SIMPLE_UPLOAD_MAX_BYTES) {
    throw new Error('Fichier trop volumineux pour cet envoi (max 4 Mo pour l\'instant).');
  }
  const siteId = await getSiteId(accessToken);
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${folderId}:/${encodeURIComponent(filename)}:/content`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': content.type || 'application/octet-stream' },
      body: content,
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Microsoft Graph ${res.status}: ${body}`);
  }
  return toDriveItem((await res.json()) as GraphDriveItemResponse);
}

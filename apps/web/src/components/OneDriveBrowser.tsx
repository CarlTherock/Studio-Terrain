import { useEffect, useRef, useState } from 'react';
import { Folder, File as FileIcon, RefreshCw, ChevronRight, Upload } from 'lucide-react';
import { listChildrenById, listFolder, uploadFile, type DriveItem } from '@studio-terrain/integrations';
import { Button } from '@studio-terrain/ui';

const ONEDRIVE_BLUE = '#0078D4';

interface Crumb {
  name: string;
  /** null only for the very first crumb (root), which has no driveItem id yet. */
  id: string | null;
}

export interface OneDriveBrowserProps {
  accessToken: string;
  /** Root label shown as the first breadcrumb. */
  rootLabel?: string;
}

/**
 * Inline OneDrive file browser — used directly inside the PWA (Documents
 * screen, SharePoint list preview) so viewing a client/project's files
 * never requires leaving the app or following an outbound link.
 */
export function OneDriveBrowser({ accessToken, rootLabel = 'Dossiers clients' }: OneDriveBrowserProps) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([{ name: rootLabel, id: null }]);
  const [items, setItems] = useState<DriveItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const current = crumbs[crumbs.length - 1] ?? crumbs[0]!;

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError(null);
    setLoading(true);
    (current.id ? listChildrenById(accessToken, current.id) : listFolder(accessToken, ''))
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur OneDrive');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, current.id]);

  function openFolder(item: DriveItem) {
    setCrumbs((prev) => [...prev, { name: item.name, id: item.id }]);
  }

  function goToCrumb(index: number) {
    setCrumbs((prev) => prev.slice(0, index + 1));
  }

  async function handleUpload(file: File) {
    if (!current.id) return;
    setUploading(true);
    setError(null);
    try {
      await uploadFile(accessToken, current.id, file.name, file);
      const children = await listChildrenById(accessToken, current.id);
      setItems(children);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi vers OneDrive");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <nav aria-label="Fil d'ariane OneDrive" className="flex flex-wrap items-center gap-1 mb-2 text-sm">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.id ?? 'root'}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={14} className="text-anthracite/30" aria-hidden="true" />}
            <button
              type="button"
              onClick={() => goToCrumb(index)}
              disabled={index === crumbs.length - 1}
              className={
                index === crumbs.length - 1
                  ? 'font-semibold text-anthracite'
                  : 'text-terracotta-text underline underline-offset-2'
              }
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>

      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="min-w-0" role="status">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-anthracite/60">
              <RefreshCw size={12} className="animate-spin" aria-hidden="true" />
              Synchronisation avec OneDrive…
            </span>
          ) : (
            items && (
              <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: ONEDRIVE_BLUE }}>
                Synchronisé avec OneDrive
              </span>
            )
          )}
        </div>
        {current.id && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = '';
              }}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs px-3 min-h-[32px]"
            >
              <Upload size={12} aria-hidden="true" />
              {uploading ? 'Envoi…' : 'Envoyer ici'}
            </Button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-danger-text mb-2">{error}</p>}

      <ul className="divide-y divide-anthracite/10">
        {items?.length === 0 && <li className="py-2 text-sm text-anthracite/50">Dossier vide.</li>}
        {items?.map((item) => (
          <li key={item.id} className="py-1.5 text-sm">
            {item.isFolder ? (
              <button
                type="button"
                onClick={() => openFolder(item)}
                className="inline-flex items-center gap-2 truncate hover:text-terracotta-text"
              >
                <Folder size={16} style={{ color: ONEDRIVE_BLUE }} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{item.name}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 truncate">
                <FileIcon size={16} className="text-anthracite/50 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.name}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

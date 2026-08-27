import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Folder,
  File as FileIcon,
  ExternalLink,
  Cloud,
  CheckCircle2,
  LogOut,
  RefreshCw,
  ChevronRight,
  Upload,
  Database,
} from 'lucide-react';
import { listChildrenById, listFolder, uploadFile, type DriveItem } from '@studio-terrain/integrations';
import { Button, Card } from '@studio-terrain/ui';
import { useLinkProjectOneDriveFolder, useProject, useProjects } from '../hooks/queries';
import { useMicrosoftAuth } from '../hooks/useMicrosoftAuth';
import { MicrosoftSignInButton } from '../components/MicrosoftSignInButton';

/** Microsoft's official OneDrive blue — used only for OneDrive-branded elements. */
const ONEDRIVE_BLUE = '#0078D4';

interface Crumb {
  name: string;
  /** null only for the root ("CLIENTS") crumb, which has no driveItem id yet. */
  id: string | null;
}

export function Documents() {
  const [searchParams] = useSearchParams();
  const projects = useProjects();
  const [projectId, setProjectId] = useState(searchParams.get('projectId') ?? '');
  const project = useProject(projectId || undefined);
  const linkFolder = useLinkProjectOneDriveFolder();
  const auth = useMicrosoftAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [crumbs, setCrumbs] = useState<Crumb[]>([{ name: 'Dossiers clients', id: null }]);
  const [items, setItems] = useState<DriveItem[] | null>(null);
  const [loadingFolder, setLoadingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // When a project already has a linked folder, start browsing there instead of the root.
  useEffect(() => {
    if (project.data?.oneDriveFolderId && project.data.oneDriveFolderName) {
      setCrumbs([
        { name: 'Dossiers clients', id: null },
        { name: project.data.oneDriveFolderName, id: project.data.oneDriveFolderId },
      ]);
    } else {
      setCrumbs([{ name: 'Dossiers clients', id: null }]);
    }
  }, [project.data?.oneDriveFolderId, project.data?.oneDriveFolderName]);

  const current = crumbs[crumbs.length - 1] ?? crumbs[0]!;

  useEffect(() => {
    setItems(null);
    setFolderError(null);
    if (!auth.account || !projectId) return;

    let cancelled = false;
    setLoadingFolder(true);
    (async () => {
      try {
        const token = await auth.getToken();
        const children = current.id ? await listChildrenById(token, current.id) : await listFolder(token, '');
        if (!cancelled) setItems(children);
      } catch (err) {
        if (!cancelled) setFolderError(err instanceof Error ? err.message : 'Erreur OneDrive');
      } finally {
        if (!cancelled) setLoadingFolder(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth.account, projectId, current.id]);

  function openFolder(item: DriveItem) {
    setCrumbs((prev) => [...prev, { name: item.name, id: item.id }]);
  }

  function goToCrumb(index: number) {
    setCrumbs((prev) => prev.slice(0, index + 1));
  }

  async function handleAssociate(item: DriveItem) {
    if (!projectId) return;
    await linkFolder.mutateAsync({
      projectId,
      folderId: item.id,
      folderName: item.name,
      webUrl: item.webUrl,
    });
  }

  async function handleUpload(file: File) {
    if (!current.id) return; // can't upload directly into the root client list
    setUploading(true);
    setFolderError(null);
    try {
      const token = await auth.getToken();
      await uploadFile(token, current.id, file.name, file);
      const children = await listChildrenById(token, current.id);
      setItems(children);
    } catch (err) {
      setFolderError(err instanceof Error ? err.message : 'Échec de l\'envoi vers OneDrive');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cloud size={24} style={{ color: ONEDRIVE_BLUE }} aria-hidden="true" />
          <h1 className="font-serif text-2xl font-semibold">Documents</h1>
        </div>
        <Link
          to="/sharepoint-lists"
          className="inline-flex items-center gap-1.5 text-sm underline underline-offset-2"
          style={{ color: ONEDRIVE_BLUE }}
        >
          <Database size={14} aria-hidden="true" />
          Listes SharePoint
        </Link>
      </div>
      <p className="text-sm text-anthracite/60">
        Parcourez les dossiers OneDrive existants sans les déplacer ni les dupliquer.
      </p>

      <Card>
        <label htmlFor="doc-project" className="block text-sm font-medium mb-1">
          Projet
        </label>
        <select
          id="doc-project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-control border border-anthracite/20 px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-terracotta"
        >
          <option value="" disabled>
            Sélectionner un projet
          </option>
          {projects.data?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Card>

      {!auth.account ? (
        <Card>
          <MicrosoftSignInButton
            onClick={() => auth.connect()}
            disabled={auth.connecting}
            label={auth.connecting ? 'Connexion…' : 'Se connecter avec Microsoft'}
          />
          <p className="text-xs text-anthracite/50 mt-2">
            Une fenêtre Microsoft s'ouvre pour choisir ou saisir le compte à utiliser.
          </p>
          {auth.error && <p className="text-sm text-danger-text mt-2">{auth.error}</p>}
        </Card>
      ) : (
        <Card className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm">
            <CheckCircle2 size={18} style={{ color: ONEDRIVE_BLUE }} aria-hidden="true" />
            Connecté à OneDrive{auth.account.username ? ` (${auth.account.username})` : ''}
          </span>
          <button
            type="button"
            onClick={() => auth.disconnect()}
            className="inline-flex items-center gap-1.5 text-sm text-anthracite/60 hover:text-anthracite"
          >
            <LogOut size={16} aria-hidden="true" />
            Déconnecter
          </button>
        </Card>
      )}

      {auth.account && !projectId && (
        <p className="text-sm text-anthracite/60">Choisissez un projet ci-dessus pour parcourir ses documents.</p>
      )}

      {auth.account && projectId && (
        <Card>
          <nav aria-label="Fil d'ariane" className="flex flex-wrap items-center gap-1 mb-3 text-sm">
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

          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="min-w-0" role="status">
              {loadingFolder ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-anthracite/60">
                  <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
                  Synchronisation avec OneDrive…
                </span>
              ) : (
                items && (
                  <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: ONEDRIVE_BLUE }}>
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Synchronisé avec OneDrive
                  </span>
                )
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
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
                    className="text-xs px-3 min-h-[36px]"
                  >
                    <Upload size={14} aria-hidden="true" />
                    {uploading ? 'Envoi…' : 'Envoyer ici'}
                  </Button>
                </>
              )}
              {project.data?.oneDriveWebUrl && (
                <a
                  href={project.data.oneDriveWebUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm underline underline-offset-2"
                  style={{ color: ONEDRIVE_BLUE }}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  Ouvrir dans OneDrive
                </a>
              )}
            </div>
          </div>

          {folderError && <p className="text-sm text-danger-text mb-2">{folderError}</p>}

          <ul className="divide-y divide-anthracite/10">
            {items?.map((item) => (
              <li key={item.id} className="py-2 flex items-center justify-between gap-3 text-sm">
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
                {!project.data?.oneDriveFolderId && item.isFolder && (
                  <Button
                    variant="ghost"
                    onClick={() => handleAssociate(item)}
                    className="text-xs px-3 min-h-[36px] shrink-0"
                  >
                    Associer à ce projet
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

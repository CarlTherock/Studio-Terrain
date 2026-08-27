import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Folder, File as FileIcon, ExternalLink, Cloud, CheckCircle2, LogOut } from 'lucide-react';
import { listChildrenById, listFolder, type DriveItem } from '@studio-terrain/integrations';
import { Button, Card } from '@studio-terrain/ui';
import { useLinkProjectOneDriveFolder, useProject, useProjects } from '../hooks/queries';
import { useMicrosoftAuth } from '../hooks/useMicrosoftAuth';

export function Documents() {
  const [searchParams] = useSearchParams();
  const projects = useProjects();
  const [projectId, setProjectId] = useState(searchParams.get('projectId') ?? '');
  const project = useProject(projectId || undefined);
  const linkFolder = useLinkProjectOneDriveFolder();
  const auth = useMicrosoftAuth();

  const [items, setItems] = useState<DriveItem[] | null>(null);
  const [loadingFolder, setLoadingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  useEffect(() => {
    setItems(null);
    setFolderError(null);
    if (!auth.account || !projectId || !project.data) return;

    let cancelled = false;
    setLoadingFolder(true);
    (async () => {
      try {
        const token = await auth.getToken();
        const children = project.data?.oneDriveFolderId
          ? await listChildrenById(token, project.data.oneDriveFolderId)
          : await listFolder(token, '');
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
  }, [auth.account, projectId, project.data?.oneDriveFolderId]);

  async function handleAssociate(item: DriveItem) {
    if (!projectId) return;
    await linkFolder.mutateAsync({
      projectId,
      folderId: item.id,
      folderName: item.name,
      webUrl: item.webUrl,
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Documents</h1>
      <p className="text-sm text-anthracite/60">
        Parcourez les dossiers OneDrive/SharePoint existants sans les déplacer ni les dupliquer.
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
          <Button onClick={() => auth.connect()} disabled={auth.connecting}>
            <Cloud size={18} aria-hidden="true" />
            {auth.connecting ? 'Connexion…' : 'Se connecter avec Microsoft 365'}
          </Button>
          {auth.error && <p className="text-sm text-danger-text mt-2">{auth.error}</p>}
        </Card>
      ) : (
        <Card className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm">
            <CheckCircle2 size={18} className="text-sage-text" aria-hidden="true" />
            Connecté avec Microsoft 365{auth.account.username ? ` (${auth.account.username})` : ''}
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">
              {project.data?.oneDriveFolderName ?? 'Dossiers clients (racine)'}
            </h2>
            {project.data?.oneDriveWebUrl && (
              <a
                href={project.data.oneDriveWebUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-terracotta-text underline underline-offset-2"
              >
                <ExternalLink size={14} aria-hidden="true" />
                Ouvrir dans OneDrive
              </a>
            )}
          </div>

          {loadingFolder && <p className="text-sm text-anthracite/60">Chargement…</p>}
          {folderError && <p className="text-sm text-danger-text">{folderError}</p>}

          <ul className="divide-y divide-anthracite/10">
            {items?.map((item) => (
              <li key={item.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 truncate">
                  {item.isFolder ? (
                    <Folder size={16} className="text-terracotta-text shrink-0" aria-hidden="true" />
                  ) : (
                    <FileIcon size={16} className="text-anthracite/50 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.name}</span>
                </span>
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

import { useEffect, useState } from 'react';
import { Database, ExternalLink, RefreshCw } from 'lucide-react';
import { listListItems, listSiteLists, type ListItem, type SharePointList } from '@studio-terrain/integrations';
import { Card } from '@studio-terrain/ui';
import { useMicrosoftAuth } from '../hooks/useMicrosoftAuth';
import { MicrosoftSignInButton } from '../components/MicrosoftSignInButton';

const WANTED_LISTS = ['Clients', 'Projets'];

/** Internal/dev-facing columns SharePoint adds to every list — noise for this preview. */
const HIDDEN_FIELDS = new Set([
  '@odata.etag',
  'id',
  'ContentType',
  'Modified',
  'Created',
  'AuthorLookupId',
  'EditorLookupId',
  '_UIVersionString',
  'Attachments',
  'Edit',
  'LinkTitleNoMenu',
  'LinkTitle',
  'ItemChildCount',
  'FolderChildCount',
  '_ComplianceFlags',
  '_ComplianceTag',
  '_ComplianceTagWrittenTime',
  '_ComplianceTagUserId',
  'AppAuthorLookupId',
  'AppEditorLookupId',
]);

/** SharePoint hyperlink columns often come back as {Description, Url} instead of a plain string. */
function extractUrl(value: unknown): string | null {
  if (typeof value === 'string' && /^https?:\/\//.test(value)) return value;
  if (value && typeof value === 'object' && 'Url' in value) {
    const url = (value as { Url?: unknown }).Url;
    if (typeof url === 'string' && /^https?:\/\//.test(url)) return url;
  }
  return null;
}

function displayValue(value: unknown): string {
  if (value && typeof value === 'object' && 'Description' in value) {
    const desc = (value as { Description?: unknown }).Description;
    if (typeof desc === 'string' && desc) return desc;
  }
  return String(value ?? '—');
}

function FieldsTable({ item }: { item: ListItem }) {
  const rows = Object.entries(item.fields).filter(([key]) => !HIDDEN_FIELDS.has(key));
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([key, value]) => {
          const url = extractUrl(value);
          return (
            <tr key={key} className="border-b border-anthracite/5 last:border-0">
              <td className="py-1 pr-3 font-medium text-anthracite/70 align-top whitespace-nowrap">{key}</td>
              <td className="py-1 text-anthracite break-words">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline underline-offset-2"
                    style={{ color: '#0078D4' }}
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                    {displayValue(value)}
                  </a>
                ) : (
                  displayValue(value)
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ListPreview({ list, accessToken }: { list: SharePointList; accessToken: string }) {
  const [items, setItems] = useState<ListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listListItems(accessToken, list.id)
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur SharePoint');
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, list.id]);

  return (
    <Card>
      <h2 className="font-semibold mb-2">{list.displayName}</h2>
      {error && <p className="text-sm text-danger-text">{error}</p>}
      {!items && !error && (
        <span className="inline-flex items-center gap-1.5 text-sm text-anthracite/60">
          <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
          Chargement…
        </span>
      )}
      {items && items.length === 0 && <p className="text-sm text-anthracite/60">Liste vide.</p>}
      <div className="space-y-4">
        {items?.map((item) => (
          <div key={item.id} className="rounded-control bg-anthracite/5 p-3 overflow-x-auto">
            <div className="flex justify-end mb-1">
              <a
                href={item.webUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs underline underline-offset-2"
                style={{ color: '#0078D4' }}
              >
                <ExternalLink size={12} aria-hidden="true" />
                Voir l'élément dans SharePoint
              </a>
            </div>
            <FieldsTable item={item} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SharePointListsPreview() {
  const auth = useMicrosoftAuth();
  const [lists, setLists] = useState<SharePointList[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.account) return;
    let cancelled = false;
    (async () => {
      try {
        const accessToken = await auth.getToken();
        if (cancelled) return;
        setToken(accessToken);
        const allLists = await listSiteLists(accessToken);
        if (!cancelled) setLists(allLists.filter((l) => WANTED_LISTS.includes(l.displayName)));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur SharePoint');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.account, auth]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Database size={22} style={{ color: '#0078D4' }} aria-hidden="true" />
        <h1 className="font-serif text-2xl font-semibold">Listes SharePoint (aperçu)</h1>
      </div>
      <p className="text-sm text-anthracite/60">
        Vue brute des listes "Clients" et "Projets" existantes, pour identifier les colonnes avant de brancher une
        vraie synchronisation.
      </p>

      {!auth.account ? (
        <Card>
          <MicrosoftSignInButton
            onClick={() => auth.connect()}
            disabled={auth.connecting}
            label={auth.connecting ? 'Connexion…' : 'Se connecter avec Microsoft'}
          />
          {auth.error && <p className="text-sm text-danger-text mt-2">{auth.error}</p>}
        </Card>
      ) : (
        <>
          {error && <p className="text-sm text-danger-text">{error}</p>}
          {!lists && !error && (
            <span className="inline-flex items-center gap-1.5 text-sm text-anthracite/60">
              <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
              Recherche des listes…
            </span>
          )}
          {lists?.length === 0 && (
            <p className="text-sm text-anthracite/60">
              Aucune liste nommée "Clients" ou "Projets" trouvée sur ce site.
            </p>
          )}
          {lists && token && lists.map((list) => <ListPreview key={list.id} list={list} accessToken={token} />)}
        </>
      )}
    </div>
  );
}

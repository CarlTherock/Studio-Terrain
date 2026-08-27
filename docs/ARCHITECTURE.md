# Architecture — StudioTerrain (Phase 0 + Phase 1)

## Monorepo

pnpm workspaces (pas de Turborepo pour l'instant — inutile pour 3-4 packages ; compatible avec un ajout ultérieur sans restructuration).

```
apps/
  web/                 # React + Vite PWA — seule application déployée (GitHub Pages)
packages/
  domain/              # types métier + règles pures, sans dépendance framework
  sync/                # schéma Dexie, interface ApiClient, LocalApiAdapter, moteur de sync simulé
  ui/                  # design system : tokens Tailwind, composants de base
  integrations/        # MSAL.js + client Microsoft Graph (OneDrive/SharePoint), voir plus bas
docs/
.github/workflows/     # CI + déploiement GitHub Pages
```

Dossiers réservés pour les phases futures (non créés) : `apps/api`, `packages/ai`, `packages/reporting`.

## Règles de dépendance entre packages

- `packages/domain` ne dépend de rien d'autre dans le monorepo.
- `packages/sync` dépend de `packages/domain`.
- `packages/ui` ne dépend de rien d'autre dans le monorepo (design system indépendant).
- `apps/web` dépend des trois packages, mais n'importe **jamais** Dexie ou les adaptateurs directement — uniquement l'interface `ApiClient` exposée par `packages/sync`.

## Couche de données locale et abstraction API

Toutes les entités transitent par l'interface `ApiClient` (`packages/sync/src/ApiClient.ts`) :

```ts
interface EntityApi<T> {
  list(filter?: Partial<T>): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(input: Omit<T, keyof BaseEntity>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>; // soft delete
}
```

Aujourd'hui, une seule implémentation existe : `LocalApiAdapter`, qui écrit dans IndexedDB (via Dexie) et ajoute une opération à la file de synchronisation. **Quand un vrai backend existera, seul un nouveau `HttpApiAdapter` implémentant la même interface devra être écrit** — l'UI (React, TanStack Query) ne change pas, car elle ne consomme que `ApiClient`, injecté via un contexte React (`createApiClient('local' | 'http')`).

## PWA : service worker vs IndexedDB

Deux mécanismes distincts, à ne pas confondre :

- **Service worker** (`vite-plugin-pwa`) : met en cache l'app shell (JS/CSS/HTML/icônes) pour un chargement hors-ligne de l'interface elle-même.
- **IndexedDB (Dexie)** : stocke les données métier (clients, projets, observations, photos...). C'est la véritable source de vérité locale, indépendante du service worker.

## Moteur de synchronisation simulé

Chaque écriture locale crée une `SyncOperation` (idempotente, identifiée par l'id + version de l'entité). Le moteur traite la file avec un délai réseau simulé, puis marque chaque opération `synced`, `conflict` ou la laisse `pending` en cas d'échec transitoire. Politique de résolution :

- Champs non critiques → dernier changement gagne automatiquement.
- Champs critiques (statut, approbation, signature, prix, échéance, contenu signé) → résolution manuelle obligatoire, jamais masquée.

L'indicateur d'état affiche toujours icône + texte : "Synchronisé", "N éléments en attente" ou "Conflit à résoudre".

## Microsoft 365 / OneDrive (correction par rapport à la version précédente de ce document)

Contrairement à ce qui était noté ici initialement, Microsoft Graph **peut** être appelé directement depuis un site 100% statique — à condition d'utiliser le flux SPA/PKCE de Microsoft Entra ID (client public, sans secret), via `@azure/msal-browser`. C'est le pattern déjà utilisé et validé par l'application sœur `emilie-pepin-designer-interieur`, dont StudioTerrain réutilise l'inscription d'application Azure (même `clientId`/`tenantId` — ce ne sont pas des secrets, ils identifient un client public).

- `packages/integrations` : `msalConfig.ts` (config MSAL, réutilise l'app Azure existante), `auth.ts` (connexion/déconnexion/acquisition de jeton via `PublicClientApplication`), `graphClient.ts` (appels Microsoft Graph : résolution du site SharePoint, listage de dossiers par chemin ou par identifiant stable).
- `apps/web/src/hooks/useMicrosoftAuth.ts` : hook React autour de `packages/integrations`.
- `apps/web/src/routes/Documents.tsx` : écran de navigation dans les dossiers OneDrive/SharePoint existants (racine `Emilie Pepin Designer Interieur/CLIENTS`), chargé en *lazy* (`React.lazy`) pour garder `@azure/msal-browser` hors du bundle initial.
- Association projet ↔ dossier par **identifiant stable** (`Project.oneDriveFolderId`), jamais par nom seul (spec §9) : une fois un dossier associé manuellement, seul son id est utilisé pour les accès suivants.
- Aucun fichier n'est déplacé, renommé ou dupliqué — uniquement lu/listé depuis son emplacement existant.

Voir [THREAT-MODEL.md](./THREAT-MODEL.md) pour la portée réelle de sécurité de ce pattern (jeton stocké côté navigateur, portée des permissions demandées).

## Déploiement

- `vite.config.ts` : `base: '/Studio-Terrain/'` (obligatoire pour une project page GitHub Pages).
- Routage : `HashRouter` — évite la configuration `404.html` nécessaire avec `BrowserRouter` sur GitHub Pages.
- `.github/workflows/deploy.yml` : build → `actions/upload-pages-artifact` → `actions/deploy-pages`. Réglages du dépôt : Pages en mode "GitHub Actions" (pas de branche `gh-pages`).
- `.github/workflows/ci.yml` : lint, typecheck, tests, build sur chaque push/PR.

## Différé aux phases suivantes (hors scope actuel)

- `apps/api` : backend réel (Fastify/NestJS, PostgreSQL, Prisma/Drizzle).
- Authentification réelle, permissions par rôle appliquées, isolement multi-organisation.
- Microsoft Graph via un vrai backend (jetons de longue durée, accès applicatif sans utilisateur connecté, opérations d'écriture à risque comme les suppressions en masse) — la lecture/association de dossiers via MSAL.js (SPA/PKCE) est déjà implémentée, voir plus haut.
- `packages/ai` : transcription de réunion, génération de comptes rendus.
- `packages/reporting` (rapports PDF/HTML formatés — l'export CSV actuel dans `ProjectDetail` est un premier pas minimal).
- Ingestion automatique des formulaires Tally (questionnaire de design, migration client) — nécessite un webhook côté serveur ; pour l'instant, simples liens externes depuis l'écran "Nouveau client".
- Chiffrement des données au repos (actuellement en clair dans IndexedDB — voir [THREAT-MODEL.md](./THREAT-MODEL.md)).

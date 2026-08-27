# Modèle de données — Phase 0 + Phase 1

## Conventions

- Identifiants : UUID (v4).
- Horodatage : `createdAt` / `updatedAt` en UTC (ISO 8601), affichage localisé côté UI.
- Suppression douce : `deletedAt` (nullable) sur les entités importantes.
- Versionnage : champ `version` (entier), incrémenté à chaque synchronisation réussie — sert à la résolution de conflit.

## Entités (sous-ensemble Phase 1 de la spec §7)

| Entité | Champs principaux | Relations |
|---|---|---|
| `Organization` | name | — (implicite, une seule instance dans cette phase) |
| `User` | orgId, name, email, roleId | Organization, Role |
| `Role` | orgId, name, permissions[] | Organization (non appliqué dans cette phase) |
| `Client` | orgId, name, contactIds[] | Organization, Contact[] |
| `Contact` | clientId, name, email?, phone? | Client |
| `Project` | orgId, clientId, name, status | Organization, Client |
| `Phase` | projectId, name, order | Project |
| `Zone` | projectId, phaseId?, name | Project, Phase |
| `Plan` | projectId, zoneId?, name | Project, Zone |
| `PlanVersion` | planId, versionLabel, fileRef | Plan |
| `Observation` | projectId, zoneId?, planVersionId?, note, photoIds[], authorId, markerX?, markerY? | Project, Zone, PlanVersion, Photo[] |
| `Photo` | observationId, blob, annotations? | Observation |
| `Task` | projectId, observationId?, title, assigneeId?, status, dueDate? | Project, Observation, User |
| `SyncOperation` | entityType, entityId, opType, payload, status, localSeq | — (méta-entité de synchronisation) |

## Note sur Organization / User / Role

Ces types existent pour préparer un futur multi-utilisateur/multi-organisation, mais **aucune authentification ni isolement n'est appliqué dans cette phase** — une seule organisation implicite est utilisée, sans connexion.

## Stockage local (IndexedDB via Dexie)

```ts
class StudioTerrainDB extends Dexie {
  clients: Table<Client, string>;
  contacts: Table<Contact, string>;
  projects: Table<Project, string>;
  zones: Table<Zone, string>;
  plans: Table<Plan, string>;
  observations: Table<Observation, string>;
  photos: Table<Photo, string>;   // Blob stocké nativement (clonage structuré Dexie)
  tasks: Table<Task, string>;
  syncQueue: Table<SyncOperation, string>;
}
```

Index principaux : `id`, `orgId`/`clientId`/`projectId` (clés étrangères filtrables), `deletedAt` (exclusion des éléments supprimés), `status`/`localSeq` sur `syncQueue`.

## Photos

Les photos sont stockées comme `Blob` directement dans IndexedDB (pas de base64) — plus efficace en mémoire. L'écriture du blob dans Dexie précède toujours la mise en file de synchronisation, pour qu'une interruption réseau ne puisse jamais faire perdre une photo déjà capturée.

# StudioTerrain

Carnet de chantier professionnel pour designers d'intérieur/extérieur et équipes de construction — PWA offline-first.

**Portée actuelle : Phase 0 (documentation) + Phase 1 (vertical slice)**, une démo 100% front-end déployée sur [GitHub Pages](https://carltherock.github.io/Studio-Terrain/). Aucun backend réel pour l'instant — voir [docs/SPEC.md](docs/SPEC.md) pour la portée complète et [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md) pour les limites de sécurité actuelles.

## Documentation

- [docs/SPEC.md](docs/SPEC.md) — portée produit de cette phase
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — monorepo, couche de données, synchronisation, déploiement
- [docs/DATA-MODEL.md](docs/DATA-MODEL.md) — entités et schéma IndexedDB
- [docs/UX.md](docs/UX.md) — écrans, design system, accessibilité
- [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md) — limites de sécurité réelles de ce prototype

## Développement

Prérequis : Node.js ≥ 20, [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev          # démarre apps/web sur http://localhost:5173
```

### Vérifications

```bash
pnpm lint
pnpm typecheck
pnpm test         # tests unitaires (Vitest) — domain, sync, web
pnpm build        # build de production (apps/web)
pnpm test:e2e     # parcours mobile complet (Playwright)
```

## Structure

```
apps/web/          # PWA React + Vite (seule application déployée)
packages/domain/    # types métier + règles pures
packages/sync/       # Dexie (IndexedDB), interface ApiClient, moteur de sync simulé
packages/ui/         # design system (tokens, composants de base)
docs/                # Phase 0
.github/workflows/   # CI + déploiement GitHub Pages
```

## Déploiement

Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui build `apps/web` et publie sur GitHub Pages via Actions (réglage du dépôt : Settings → Pages → Source = "GitHub Actions").

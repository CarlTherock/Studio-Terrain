# Modèle de menaces — StudioTerrain (Phase 0 + Phase 1)

## Portée réelle de cette phase

**Cette application est actuellement un prototype 100% client, sans backend, sans authentification et sans isolement multi-utilisateur.** Ce document existe pour ne jamais laisser croire que des garanties de sécurité existent avant qu'elles ne soient réellement implémentées (Phase 4+ de la spec complète).

## Ce qui est vrai aujourd'hui

- Servi en HTTPS via GitHub Pages.
- Aucun secret dans le bundle (rien à protéger côté client : pas de clé API, pas de token).
- Aucune donnée transmise sur le réseau — la synchronisation est entièrement simulée localement, aucun appel réseau réel n'a lieu.
- Le code source et le bundle final sont publics (dépôt GitHub public + site GitHub Pages public).

## Ce qui n'est PAS protégé (limites explicites)

- **Données non chiffrées en local** : tout ce qui est stocké dans IndexedDB (clients, projets, photos, observations) est en clair, lisible par quiconque a accès physique à l'appareil ou aux DevTools du navigateur.
- **Aucune authentification** : n'importe qui ouvrant l'URL a accès à toutes les données stockées sur cet appareil — il n'y a pas de notion de compte ni de session.
- **Aucun isolement multi-tenant** : les types `Organization`/`User`/`Role` existent dans le modèle de données mais aucune règle de permission n'est appliquée.
- **Aucune protection contre la perte de l'appareil** : effacer les données du navigateur ou perdre l'appareil entraîne la perte définitive des données locales (pas de sauvegarde serveur).
- **Pas de protection CSRF/XSS/injection côté serveur** : il n'y a pas de serveur, donc ces protections ne s'appliquent pas encore — elles seront nécessaires dès qu'un `HttpApiAdapter` réel sera introduit (voir [ARCHITECTURE.md](./ARCHITECTURE.md)).

## Conséquence pratique

**Ne pas utiliser cette application pour des données client réelles ou sensibles tant que la Phase 4 (backend réel, authentification, chiffrement, Microsoft Graph) n'est pas livrée.** C'est un prototype de démonstration et de validation UX, pas un outil de production.

## Risques à traiter avant tout usage réel (Phase 2+)

- Authentification et gestion de session (Microsoft Entra ID prévu, autorization code + PKCE).
- Chiffrement des données au repos et en transit.
- Isolement strict par organisation/projet côté serveur (pas seulement côté UI).
- Journal d'audit append-only.
- Limites de taille de fichier et analyse antivirus des documents/photos importés.
- Rotation de session, protection CSRF/XSS/injection SQL côté API réelle.
- Politique de rétention et suppression conforme (export + suppression sur demande).

# StudioTerrain — Spécification (Phase 0 + Phase 1)

## Portée de cette phase

Ce document couvre uniquement les **Phase 0 (Découverte)** et **Phase 1 (Vertical slice)** de la vision complète StudioTerrain. La spécification produit complète (réunions IA, Microsoft Graph, backend PostgreSQL, rentabilité) reste la cible à long terme, mais **n'est pas implémentée ici**.

### Non-objectifs de cette phase

- Aucun backend réel : pas de serveur, pas de base de données PostgreSQL.
- Aucune authentification réelle ni isolement multi-organisation.
- Aucune intégration Microsoft Graph / OneDrive / SharePoint.
- Aucune transcription audio ni compte rendu généré par IA.
- Aucun envoi d'email, notification push ou webhook.

Tout est exécuté et stocké **dans le navigateur** (IndexedDB), avec une file de synchronisation **simulée** — préparant le terrain pour un vrai backend plus tard sans réécriture de l'interface.

## Vision produit (rappel)

StudioTerrain relie dans un seul fil de preuve : photo/note vocale → zone/plan → observation → responsable → décision → signature → rapport → dossier client, pour les designers d'intérieur/extérieur, architectes, chargés de projet et équipes de chantier.

## Parcours couverts par le vertical slice

1. Créer un client.
2. Créer un projet et au moins une zone.
3. Afficher le cockpit visuel (résumé, indicateur de synchronisation).
4. Ouvrir un plan de démonstration et y déposer un marqueur.
5. Ajouter une observation avec photo, note et marqueur.
6. Attribuer une tâche à un intervenant.
7. Travailler sans réseau (les données restent visibles et modifiables).
8. Fermer et rouvrir l'application (persistance locale confirmée).
9. Synchroniser avec un serveur simulé et afficher l'état (synchronisé / en attente / conflit).

## Rôles modélisés (sans application de permissions dans cette phase)

Organisation, Utilisateur, Rôle, Client, Intervenant sont modélisés comme types de données (voir [DATA-MODEL.md](./DATA-MODEL.md)), mais **aucune règle de permission n'est appliquée** — il n'y a pas de connexion/authentification dans cette phase. Une seule organisation implicite est utilisée.

## Critères de succès (repris de la spec §11, adaptés à la portée statique)

- Créer une observation avec photo doit être rapide et tenir en une seule action principale.
- Un projet déjà créé localement doit afficher ses plans, observations et tâches sans réseau.
- Une interruption pendant la capture d'une photo ne doit pas perdre le fichier (écriture IndexedDB avant mise en file de synchronisation).
- L'état de synchronisation doit toujours être visible avec icône **et** texte, jamais la couleur seule.
- Aucune icône seule sans `aria-label` ou libellé visible.
- Contraste WCAG AA sur toutes les paires texte/fond utilisées.

Voir aussi [ARCHITECTURE.md](./ARCHITECTURE.md), [DATA-MODEL.md](./DATA-MODEL.md), [UX.md](./UX.md) et [THREAT-MODEL.md](./THREAT-MODEL.md).

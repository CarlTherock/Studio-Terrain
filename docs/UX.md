# UX — StudioTerrain (Phase 0 + Phase 1)

## Principes

- Une action principale par écran.
- Bouton terrain "Ajouter au chantier" toujours atteignable au pouce (mobile).
- Aucun emoji comme icône, statut ou indicateur — bibliothèque Lucide, chaque icône porte un `aria-label` ou un libellé texte adjacent.
- Cibles tactiles ≥ 44 px.
- Contraste WCAG AA minimum sur toute paire texte/fond.
- Animations sobres, 150–250 ms.

## Navigation

Mobile (nav du bas, 5 entrées) : **Accueil, Projets, Terrain, Réunions, Recherche**.

- "Terrain" ouvre directement l'action "Ajouter au chantier" (nouvelle observation).
- "Réunions" est désactivé dans cette phase (infobulle "Bientôt disponible") — module hors scope.
- "Recherche" est un filtre simple côté client sur les entités déjà en cache local.

## Écrans du vertical slice

1. **Cockpit** — cartes résumé (projets actifs, éléments en attente de sync, observations récentes), indicateur de synchronisation dans l'en-tête, bouton central "Ajouter au chantier".
2. **Client — nouveau** — formulaire simple (nom, contact).
3. **Projet — nouveau** — nom, client, création d'au moins une zone dans le même formulaire.
4. **Détail projet** — zones, plans, observations récentes, tâches.
5. **Visionneuse de plan** — image de démonstration, zoom/déplacement, marqueur posé au tap.
6. **Nouvelle observation** — photo (capture ou fichier), note, marqueur pré-rempli si venant du plan, une seule action "Enregistrer".
7. **Nouvelle tâche** — titre, intervenant assigné, échéance, statut.
8. **État de synchronisation (détail)** — liste des opérations en attente/conflit, action de résolution.

## Palette (tokens)

| Rôle | Couleur | Usage |
|---|---|---|
| Fond | Ivoire `#FBF9F4` | Arrière-plan général |
| Texte | Anthracite `#2B2E33` | Texte principal |
| Accent 1 | Terracotta `#C1613D` (fill) / `#8A4429` (texte) | Actions principales |
| Accent 2 | Vert sauge `#8FA687` (fill) / `#4E5E48` (texte) | Confirmation / succès |
| Accent 3 | Bleu pétrole `#1F5B6B` | Information / liens |

Deux nuances par accent (fill clair pour remplissages/icônes, teinte foncée pour texte sur ivoire) afin de garantir le contraste AA.

## Indicateur de synchronisation

Toujours icône + texte, jamais couleur seule :

- `CloudCheck` + "Synchronisé"
- `RefreshCw` + "N éléments en attente"
- `AlertTriangle` + "Conflit à résoudre"

## Accessibilité

- Navigation clavier complète sur tous les parcours critiques.
- Lecteur d'écran : chaque icône interactive a un `aria-label` explicite.
- Aucune information (statut, priorité) transmise uniquement par la couleur.

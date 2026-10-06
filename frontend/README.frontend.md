# ChessMove — Frontend


## Technologies utilisées

| Technologie | Utilisation |
| --- | --- |
| React | Construire l’interface avec des composants |
| TypeScript | Définir les types et détecter certaines erreurs |
| Vite | Lancer le serveur de développement et générer le build |
| React Router | Gérer la navigation entre les pages |
| Styled Components | Définir les styles des composants React |

Les dépendances sont déclarées dans `package.json`.
Le fichier `package-lock.json` conserve les versions installées.

## Lancer le frontend

Depuis le dossier `frontend` :

```bash
npm install
npm run dev
```

Ouvrir l’adresse affichée par Vite.

Pour arrêter le serveur : `Ctrl + C`.

Pour vérifier que le frontend compile :

```bash
npm run build
```

## Organisation des fichiers

- `src/components/` : composants réutilisables.
- `src/pages/` : pages de l’application.
- `src/routes/AppRoutes.tsx` : définition des routes.
- `src/styles/global.css` : styles communs et reset CSS.
- `src/styles/variables.css` : couleurs de l’application.
- `public/icons/` : icônes, notamment la tour du logo.
- `public/pieces/kosal/` : pièces d’échecs au format SVG.

Les composants migrés vers Styled Components utilisent
un fichier `.styles.ts` à côté de leur fichier `.tsx`.

## Pages réalisées

- `Home` : landing page avec titre, bouton Start et échiquier.
- `PrivacyPolicy` : politique de confidentialité.
- `TermsOfService` : conditions d’utilisation et crédits.

Les liens vers les autres pages sont prévus dans la navbar.

## Composants réalisés

### Navbar

Affiche le logo ChessMove, les liens de navigation et les boutons
Log in et Sign up.

### Footer

Affiche les liens vers les pages légales et l’année courante,
obtenue avec `new Date().getFullYear()`.

### Button

Composant partagé avec trois variantes :

- `primary` : fond violet, utilisé pour Sign up.
- `secondary` : fond transparent et contour violet, utilisé pour Log in.
- `accent` : fond vert citron, utilisé pour Start.

Avec la propriété `to`, il utilise un lien React Router.
Sans `to`, il utilise un bouton HTML et peut recevoir une action `onClick`.

### ChessBoard

Affiche une grille de 64 cases et les pièces dans leur position initiale.

Les cases sont générées avec `Array.from`.
Leur couleur dépend de la ligne et de la colonne.

Les pièces sont des images SVG affichées dans les cases.
Les règles de déplacement ne sont pas encore intégrées.

## Charte graphique

Police utilisée : Poppins, chargée depuis Google Fonts.

| Couleur | Valeur |
| --- | --- |
| Fond | `#14131B` |
| Surface | `#201E2B` |
| Bordures | `#393548` |
| Texte principal | `#F5F3FA` |
| Texte secondaire | `#B8B3C8` |
| Violet principal | `#A78BFA` |
| Accent vert citron | `#D4F566` |
| Case claire | `#E8E1D5` |
| Case sombre | `#82798A` |

Les couleurs sont définies comme variables CSS dans `variables.css`.

## Mise en page responsive

La classe commune `container` limite la largeur du contenu
à 1200 px et ajoute un padding de 24 px.

Sur grand écran, la landing page utilise trois colonnes :
texte, échiquier et espace latéral.

À partir de 900 px et en dessous, le contenu passe sur une colonne
et le titre est centré.

## Notions React utilisées

### Props (ButtonProps)

Les props transmettent des informations à un composant :
texte, destination ou variante d’un bouton.

### children

`children` représente le contenu placé entre les balises
d’un composant.

```tsx
<Button to="/register">Sign up</Button>
```

Ici, `children` correspond à « Sign up ».

### useState

`useState` appartient à React : ce n’est pas une dépendance supplémentaire.

https://react.dev/reference/react/useState

Il mémorise une information et déclenche une mise à jour
de l’affichage quand elle change.

Nous l’utilisons pour préparer la sélection d’une pièce.

### Propriétés de style avec $

Les propriétés comme `$isLight` et `$variant` servent aux styles.
Le préfixe `$` évite de les transmettre comme attributs HTML.

## Accessibilité

- Utilisation d’éléments HTML comme `main`, `nav` et `footer`.
- Nom accessible pour la navigation et l’échiquier.
- Images décoratives avec `alt=""`.
- Séparateurs décoratifs du footer avec `aria-hidden="true"`.
- Indicateur de focus sur les boutons.
- Respect de la préférence de réduction des animations.

L’accessibilité reste à vérifier au fur et à mesure du développement.

## Crédits des pièces

Les pièces SVG proviennent du jeu Kosal créé par Philatype.

- Source : https://github.com/philatype/kosal
- Licence : Creative Commons Attribution 4.0
- Licence complète : https://creativecommons.org/licenses/by/4.0/

Le fichier `LICENSE.txt` est conservé dans `public/pieces/kosal/`.
Le crédit est également affiché dans la page Terms of Service.

## Prochaines étapes

- [x] Ajouter et tester l’effet de sélection des pièces (d'échec).
- [x] Créer les formulaires d’inscription et de connexion.
- [x] Afficher les critères du mot de passe pendant la saisie.
- [x] Vérifier la confirmation du mot de passe.
- [x] Ajouter l’œil pour afficher ou masquer les mots de passe.
- [x] Bloquer l’inscription si les critères du mot de passe ne sont pas respectés.
- [ ] Relier les formulaires au backend et afficher les erreurs ou confirmations.
- [ ] Construire l’espace joueur.
- [ ] Créer le profil avec avatar, statistiques et historique des matchs.
- [ ] Créer le classement des joueurs (ranking).
- [ ] Ajouter le chat entre joueurs.
- [ ] Relier l’échiquier à la logique de jeu développée par l’équipe.
- [ ] Synchroniser les parties entre les joueurs.
- [ ] Brancher les traductions en français, anglais et espagnol.
Si le temps le permet :
- [ ] Ajouter le parcours « Mot de passe oublié », avec le backend.

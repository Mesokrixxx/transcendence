# ChessMove — Frontend

Ce document explique comment lancer le frontend de ChessMove, comment le code est organisé et comment l’interface communique avec le backend. Les tâches et leur avancement sont suivis dans Trello.

## Technologies utilisées

| Technologie | Utilisation |
| --- | --- |
| React | Construire l’interface avec des composants |
| TypeScript | Définir les types et détecter certaines erreurs |
| Vite | Lancer le serveur de développement et générer le build |
| React Router | Gérer la navigation entre les pages |
| Styled Components | Définir les styles des composants React |
| i18next et react-i18next | Gérer les traductions de l’interface |

Les dépendances sont déclarées dans `package.json`. Le fichier `package-lock.json` conserve les versions installées.

## Lancer le frontend

Depuis le dossier `frontend/` :

```bash
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite. Pour arrêter le serveur : `Ctrl + C`.

Pour vérifier la compilation et les traductions :

```bash
npm run build
npm run i18n:check
```

Pour tester les fonctionnalités qui dépendent du backend et de la base de données, démarrer l’application complète depuis la racine du dépôt. Avec la configuration locale des conteneurs, l’application est accessible sur [https://localhost:4243](https://localhost:4243).

## Organisation des fichiers

| Chemin | Rôle |
| --- | --- |
| `src/components/` | Composants réutilisables |
| `src/pages/` | Pages de l’application |
| `src/routes/AppRoutes.tsx` | Définition des routes |
| `src/context/` | État partagé, notamment l’utilisateur connecté |
| `src/styles/global.css` | Styles communs et reset CSS |
| `src/styles/variables.css` | Couleurs de l’application |
| `src/services/passwordValidation.ts` | Validation des mots de passe |
| `src/services/fetchAPI.ts` | Fonction commune pour les requêtes HTTP en JSON |
| `src/services/avatar.ts` | Envoi de la photo de profil |
| `src/types/fetch.ts` | Types des requêtes, réponses et erreurs de l’API |
| `public/icons/` | Icônes, notamment la tour du logo |
| `public/avatars/` | Avatars fournis avec l’application |
| `public/pieces/kosal/` | Pièces d’échecs au format SVG |
| `public/locales/` | Fichiers de traduction |

Les composants stylés utilisent généralement un fichier `.styles.ts` à côté de leur fichier `.tsx`.

## Communication avec le backend

La fonction commune `fetchAPI`, dans `src/services/fetchAPI.ts`, s’appuie sur le modèle proposé par Noa. Elle centralise :

- Les appels HTTP à l’API.
- L’envoi des données au format JSON lorsque la requête contient un corps.
- L’option `credentials: 'include'` pour les cookies de session.
- La lecture des réponses JSON et des réponses sans contenu.
- Le traitement des erreurs HTTP, des erreurs réseau et des réponses JSON invalides.

### Configuration de l’URL

Le frontend utilise le préfixe `/api`. Par exemple, un appel avec le chemin `/auth/login` envoie une requête à `/api/auth/login`.

En développement, le proxy est défini dans `vite.config.ts`. Dans les conteneurs, Nginx transmet les requêtes `/api` au service `backend:8080`.

### Types des réponses

Les types sont définis dans `src/types/fetch.ts` :

- `Method`
- `RequestOptions`
- `APIError`
- `APIResponse`
- `SuccessfulResponse`
- `ErrorResponse`

`fetchAPI` renvoie une réponse contenant `result` et `error`. `APIError` accepte les deux formats utilisés par le backend : une chaîne ou un objet contenant `error` et éventuellement `details`.

### Session utilisateur

Les formulaires d’inscription et de connexion utilisent l’API. Le frontend récupère l’utilisateur connecté via `/api/auth/me` et partage ces informations dans le contexte d’authentification. La barre de navigation s’appuie sur ce contexte pour afficher soit les boutons de connexion et d’inscription, soit le menu du compte.

La connexion via GitHub est proposée lorsque la configuration OAuth est disponible. Voir la [documentation OAuth](../OAuth.README.md).

### Envoi de la photo de profil

Dans **Profil → Modifier le profil**, sélectionner une image affiche un aperçu immédiat. Au clic sur **Enregistrer**, `src/services/avatar.ts` envoie le fichier dans un `FormData` à `POST /api/users/me/avatar`. Cette requête utilise une fonction dédiée ; `fetchAPI` continue de gérer les échanges en JSON.

Le formulaire accepte les images JPEG, PNG et WebP jusqu’à 2 Mio. Le serveur vérifie aussi le fichier. Après un envoi réussi, l’URL renvoyée met à jour l’avatar dans le profil et la barre de navigation. Après un rechargement, le frontend retrouve cette URL via `/api/auth/me`.

Cliquer sur **Annuler** ferme le formulaire sans envoyer la photo sélectionnée. Voir la [documentation de l’avatar](../docs/avatar-upload.md) pour le traitement et le stockage côté serveur.

## Pages de l’application

| Page | Rôle |
| --- | --- |
| `Home` | Page d’accueil avec présentation, bouton Get Started et échiquier |
| `Login` | Formulaire de connexion |
| `Register` | Formulaire d’inscription avec validation du mot de passe |
| `Profile` | Profil du joueur, édition du pseudo et de l’avatar, onglets d’activité |
| `Rankings` | Classement des joueurs avec avatars, médailles et recherche par pseudo |
| `Play` | Interface de jeu avec échiquier interactif, coups possibles, promotion et état de la partie |
| `Training` | Page d’entraînement |
| `Watch` | Liste des parties présentées dans l’interface spectateur |
| `WatchGame` | Échiquier en lecture seule, avec possibilité d’inverser l’orientation |
| `Chat` | Interface de messagerie |
| `PrivacyPolicy` | Politique de confidentialité |
| `TermsOfService` | Conditions d’utilisation et crédits |
| `ErrorPage` | Composant partagé pour les pages 401, 403, 404 et 500 |

La route `/watch/:gameId` identifie la partie à afficher dans la vue spectateur.

## Composants réutilisables

### Navbar

Affiche le logo ChessMove, les liens de navigation et le sélecteur de langue. Quand le joueur est connecté, `UserMenu` affiche son avatar, son pseudo et les actions de compte. Sur petit écran, la navigation s’ouvre depuis un bouton de menu.

### Footer

Affiche les liens vers les pages légales et l’année courante, obtenue avec `new Date().getFullYear()`.

### Button

Composant partagé avec trois variantes :

- `primary` : fond violet, par exemple pour Sign up.
- `secondary` : fond transparent et contour violet, par exemple pour Log in.
- `accent` : fond vert citron, par exemple pour Start.

Avec la propriété `to`, le composant utilise un lien React Router. Sans `to`, il utilise un bouton HTML et peut recevoir une action `onClick`.

### ChessBoard

Composant partagé entre l’accueil, le jeu et les vues spectateur. Il affiche une grille de 64 cases et les pièces SVG.

- Sur l’accueil, il affiche la position initiale.
- Dans le jeu, il reçoit la position de la partie.
- Les destinations autorisées sont indiquées par des points et les captures possibles par des cercles.
- L’orientation peut être blanche ou noire.
- La propriété `readOnly` empêche les interactions dans les vues spectateur et les miniatures.

Le moteur `chessgame`, développé par Noa, fournit les règles du jeu. L’interface gère notamment la sélection des pièces et le choix de promotion.

### GameStatus

Affiche le joueur dont c’est le tour, l’échec, l’échec et mat avec le gagnant, ou le match nul. Le composant est partagé entre `Play` et `WatchGame`.

### ChatBox

Affiche un titre, une liste de messages et un formulaire d’envoi. Le composant regroupe les éléments d’interface du chat ; la source des messages dépend de la page qui l’utilise.

### Avatar

Affiche l’image d’un joueur avec une taille configurable et, si demandé, un indicateur de statut. Le composant est utilisé dans plusieurs écrans, notamment le profil et le classement. Le profil et le menu du compte affichent `/avatars/default.svg` lorsque l’utilisateur n’a pas choisi de photo.

### Formulaires d’authentification

Les pages de connexion et d’inscription utilisent des composants de formulaire réutilisables. L’inscription vérifie les critères du mot de passe et sa confirmation. Les champs concernés permettent d’afficher ou de masquer le mot de passe.

## Internationalisation

L’interface est disponible en français (`fr`), anglais (`en`) et espagnol (`es`). Les traductions sont rangées dans `public/locales/`, par langue et par thème : `auth`, `profile`, `navigation`, `errors`, etc. La barre de navigation permet de changer de langue.

Depuis `frontend/`, après avoir ajouté ou modifié des clés :

```bash
npm run i18n:extract
npm run i18n:types
npm run i18n:check
```

Compléter les valeurs dans les trois langues avant de lancer la vérification finale.

## Charte graphique

La police utilisée est **Poppins**, chargée depuis Google Fonts. Les couleurs sont définies sous forme de variables CSS dans `src/styles/variables.css`.

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

## Mise en page responsive

La classe commune `.container` limite la largeur du contenu à 1200 px et ajoute une marge intérieure de 24 px. Certaines pages, notamment l’accueil, possèdent leurs propres règles de dimensionnement.

Sur grand écran, l’accueil utilise trois colonnes : le texte, l’échiquier et un espace latéral. À 900 px et en dessous, le contenu passe sur une colonne et le titre est centré.

## Notions React utilisées

### Props

Les props transmettent des informations à un composant. Par exemple, `Button` reçoit une destination avec `to` et peut recevoir une variante avec `variant`.

### children

`children` représente le contenu placé entre les balises d’un composant :

```tsx
<Button to="/register">Sign up</Button>
```

Ici, `children` correspond à « Sign up ».

### Hooks React utilisés

| Hook | À quoi il sert dans ChessMove |
| --- | --- |
| `useState` | Gérer la saisie des formulaires, l’ouverture des menus et la sélection des pièces. Dans le formulaire de profil, il conserve aussi le fichier choisi jusqu’au clic sur Enregistrer. |
| `useEffect` | Gérer ce qui doit être mis en place puis nettoyé : par exemple, ajouter et retirer les écouteurs clavier de la navigation, ou libérer l’URL temporaire de l’aperçu quand le formulaire de profil se ferme. |
| `useRef` | Accéder à un élément HTML ou conserver une valeur sans redessiner le composant. Le formulaire l’utilise pour ouvrir la boîte de dialogue et garder une référence à l’URL temporaire de l’aperçu. |
| `useId` | Générer des identifiants stables pour relier les boutons de navigation aux menus qu’ils contrôlent, avec `aria-controls`. |
| `useContext` | Lire l’état partagé de l’utilisateur connecté. Le hook `useAuth`, propre au projet, s’appuie dessus pour donner accès au compte dans le profil et la barre de navigation. |

### Propriétés de style avec `$`

Dans Styled Components, les propriétés comme `$isLight` et `$variant` servent à choisir un style. Le préfixe `$` évite qu’elles soient transmises comme attributs HTML.

## Accessibilité

- Utilisation d’éléments HTML comme `main`, `nav` et `footer`.
- Noms accessibles pour la navigation, les boutons à icône et l’échiquier.
- Images décoratives avec `alt=""` et séparateurs décoratifs masqués avec `aria-hidden="true"`.
- Indicateurs de focus visibles sur les boutons.
- Prise en compte de la préférence de réduction des animations.
- Fermeture au clavier de certains menus et du formulaire de profil.

## Crédits des pièces

Les pièces SVG proviennent du jeu [Kosal de Philatype](https://github.com/philatype/kosal), sous licence [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

Le fichier de licence est conservé dans [`public/pieces/kosal/LICENSE.txt`](public/pieces/kosal/LICENSE.txt). Le crédit figure aussi dans la page Terms of Service.
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
- `src/services/passwordValidation.ts` : validation des mots de passe.
- `src/services/fetchAPI.ts` : fonction commune pour les appels HTTP, adaptée du modèle de Noa.
- `src/types/fetch.ts` : types TypeScript des requêtes, des réponses et des erreurs API.

Les composants migrés vers Styled Components utilisent
un fichier `.styles.ts` à côté de leur fichier `.tsx`.


## Communication avec le backend

La fonction commune `fetchAPI` est implémentée dans `src/services/fetchAPI.ts`, à partir du modèle proposé par Noa.

Elle centralise :

- Les méthodes HTTP `get`, `post`, `put` et `delete`.
- L’envoi des données au format JSON.
- L’option `credentials: 'include'` pour les cookies de session.
- La lecture des réponses JSON et des réponses sans contenu.
- Le traitement des erreurs HTTP, des erreurs réseau et des réponses JSON invalides.

### Configuration de l’URL

Le modèle initial prévoyait `VITE_API_URL`. Dans la configuration actuelle, la fonction utilise directement `/api`, avec le proxy défini dans `vite.config.ts`.

Les appels utilisent donc un chemin comme `/auth/login`, pour obtenir `/api/auth/login`.

Dans les conteneurs, le proxy transmet les requêtes au service `backend:8080`.

### Types des réponses

Les types sont activés et exportés dans `src/types/fetch.ts` :

- `Method`
- `RequestOptions`
- `APIError`
- `APIResponse`
- `SuccessfulResponse`
- `ErrorResponse`

La fonction renvoie une réponse contenant `result` et `error`.

Le type `APIError` accepte les deux formats observés dans le backend : une chaîne JSON ou un objet contenant `error` et éventuellement `details`.

### État des tests

- [x] Vérifier la compilation du frontend.
- [x] Envoyer une requête POST vers `/api/auth/login`.
- [x] Vérifier la réception d’une erreur de validation et de ses détails.
- [ ] Tester une réponse réussie.
- [ ] Vérifier la création et la réutilisation du cookie de session.
- [ ] Tester la réponse sans contenu du logout.
- [ ] Tester une erreur renvoyée sous forme de chaîne JSON.
- [ ] Tester une erreur réseau.

Une page temporaire `ApiTest`, accessible via `/test-api`, sert aux vérifications. Elle sera retirée avec sa route une fois les tests terminés.

Les formulaires de connexion et d’inscription restent à relier au backend.

## Pages réalisées

- `Home` : landing page avec titre, bouton Get Started et échiquier.
- `Login` : formulaire de connexion.
- `Register` : formulaire d'inscription avec validation du mot de passe.
- `Profile` : interface du profil joueur avec avatar et bouton Edit.
- `Rankings` : classement des joueurs, développé par un membre de l'équipe.
- `PrivacyPolicy` : politique de confidentialité.
- `TermsOfService` : conditions d'utilisation et crédits.
- `Play` : partie locale connectée au moteur `chessgame`, avec coups possibles, promotion, état de la partie et chat local.
- `Watch` : liste de démonstration des parties, avec échiquiers miniatures et noms des joueurs.
- `WatchGame` : vue spectateur en lecture seule, avec inversion de l’orientation et chat local.
- `Chat` : interface de chat avec messages locaux.
- `ApiTest` : page temporaire de test des appels API.

La route `/watch/:gameId` est définie. Le chargement de la partie correspondant à cet identifiant depuis le backend reste à réaliser.

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

Composant partagé entre Home, Play et les vues spectateur.

Il affiche une grille de 64 cases et les pièces SVG :

- Sur Home, il affiche la position initiale.
- Sur Play, il reçoit la position du moteur `chessgame`.
- Les destinations autorisées sont indiquées par des points et les captures possibles par des cercles.
- L’orientation peut être blanche ou noire.
- La propriété `readOnly` empêche les interactions dans les vues spectateur et les miniatures.

Les règles de déplacement sont fournies par le moteur de Noa. La page Play gère l’état de la partie locale, la sélection et la promotion.

L’avatar, l’état de la partie et le chat sont disposés autour de l’échiquier par la page Play.

L’ancien composant `PlayableChessBoard` a été supprimé.

### GameStatus

Reçoit la partie et affiche :

- Le joueur dont c’est le tour.
- L’échec.
- L’échec et mat et le gagnant.
- Le match nul.

Ce composant est partagé entre Play et WatchGame.

### ChatBox

Affiche un titre, une liste de messages et un formulaire d’envoi.

Les messages sont actuellement gérés dans l’état local du composant. L’enregistrement, l’historique et les échanges en temps réel restent à connecter au backend.

### Avatar

Composant réutilisable permettant d'afficher l'avatar d'un joueur.

Il accepte notamment une image, un pseudo, une taille et un statut de connexion. Si aucune image n'est fournie, il affiche une initiale.

Il est destiné à être utilisé dans le profil, le classement et la liste d'amis.

### Formulaires d'authentification

Les pages de connexion et d'inscription utilisent des composants de formulaire réutilisables.

L'inscription comprend la vérification des critères du mot de passe, sa confirmation et la possibilité d'afficher ou de masquer les mots de passe.

La connexion au backend reste à réaliser.

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

La classe commune container définit une largeur maximale de 1200 px et un padding de 24 px. Certaines pages, notamment Home, possèdent leurs propres règles de dimensionnement. Le responsive mobile et tablette reste en cours d'amélioration.

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

Nous l'utilisons notamment pour gérer la sélection des pièces sur l'échiquier et les interactions des formulaires.

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


### Interface et authentification
- [x] Créer les formulaires d’inscription et de connexion.
- [x] Afficher les critères du mot de passe pendant la saisie.
- [x] Vérifier la confirmation du mot de passe.
- [x] Ajouter la possibilité d’afficher ou de masquer les mots de passe.
- [x] Bloquer l’inscription si les critères du mot de passe ne sont pas respectés.
- [ ] Relier le formulaire Login au backend via `fetchAPI`.
- [ ] Confirmer la route et les champs attendus pour l’inscription.
- [ ] Relier le formulaire Sign up au backend via `fetchAPI`.
- [ ] Afficher les erreurs, les confirmations et l’état de chargement des formulaires.
- [ ] Gérer l’état de connexion de l’utilisateur dans le frontend.
- [ ] Adapter la Navbar une fois connecté et ajouter la déconnexion.


### Échiquier et logique de jeu
- [ ] Rendre l'échiquier responsive et adapter sa taille aux différentes résolutions d'écran (Mac et écrans de l'école).
- [x] Ajouter et tester l’effet de sélection des pièces.
- [x] Intégrer le moteur `chessgame` développé par Noa.
- [x] Connecter les interactions aux déplacements et aux règles du jeu.
- [x] Réutiliser le composant `ChessBoard` sur Home, Play et Watch.
- [x] Afficher les destinations autorisées et les captures possibles.
- [x] Gérer le choix de promotion dans Play.
- [x] Créer le composant partagé `GameStatus`.
- [x] Adapter l’orientation selon le tour du joueur en mode local.
- [x] Ajouter un délai de 700 ms avant le changement d’orientation.
- [ ] Fixer l’orientation selon la couleur attribuée au joueur connecté (`playerColor`).
- [ ] Synchroniser les parties entre les joueurs via le backend.

### Mode spectateur
- [x] Créer une liste de démonstration avec miniatures et noms des joueurs.
- [x] Ajouter la navigation vers `/watch/:gameId`.
- [x] Afficher les joueurs et l’état de la partie dans `WatchGame`.
- [x] Empêcher les spectateurs de déplacer les pièces.
- [x] Permettre aux spectateurs d’inverser l’orientation.
- [ ] Charger la liste réelle des parties en cours depuis le backend.
- [ ] Charger la partie correspondant à `gameId`.
- [ ] Actualiser le plateau et l’état de la partie en temps réel.


### Espace joueur
- [x] Créer le composant Avatar réutilisable.
- [x] Ajouter le bouton Edit au profil.
- [x] Permettre de choisir un avatar et d’en afficher un aperçu.
- [x] Ajouter les champs facultatifs prénom et nom.
- [x] Permettre de modifier localement le pseudo, le prénom et le nom.
- [ ] Ajouter les actions Enregistrer et Annuler.
- [ ] Charger les informations du joueur connecté depuis le backend.
- [ ] Enregistrer les modifications du profil et de l’avatar via le backend.
- [ ] Afficher les confirmations et les erreurs.
- [ ] Afficher l’historique des parties.
- [ ] Intégrer l’accès à la liste d’amis.

### Liste d’amis
- [ ] Afficher les amis avec avatar, pseudo et statut de connexion.
- [ ] Envoyer une demande d’ami.
- [ ] Accepter ou refuser une demande.
- [ ] Annuler une demande envoyée.
- [ ] Supprimer un ami.
- [ ] Bloquer et débloquer un joueur.
- [ ] Permettre d’ouvrir et de fermer le panneau des amis.
- [ ] Relier les données et les actions au backend.
- [ ] Afficher les confirmations et les erreurs.

### Classement
- [x] Créer l’interface du classement avec des données fictives.
- [x] Intégrer les avatars et les médailles.
- [ ] Adapter le classement aux écrans mobiles : tableau lisible, colonnes accessibles et aucun débordement de la page.
- [ ] Relier le classement aux données du backend.
- [x] Intégrer le composant Avatar au ranking.

#### ce dont ranking a besoin cote backend
    - Une route qui envoie la liste des joeurs triee
        format suggere : [{id, username, wins, games}]
    - classement par victoire ou par Elo (score de niveau, selon resultat et niv de l'adversaire)?

### Chat
- [x] Créer le composant ChatBox avec envoi de messages locaux.
- [x] Intégrer le chat dans Play et WatchGame.
- [ ] Charger l’historique depuis le backend.
- [ ] Envoyer et recevoir les messages en temps réel.

#### ce dont chat a besoin cote backend
    - Enregistrer les messages en base, et renvoyer l’historique a quelqu’un qui arrive dans un chat (route ou inclusion dans la reponse existante : a decider ensemble).
    - Valider le format des messages (pas vide, longueur maximale).
    - Identifier l’auteur cote serveur (via un jeton), jamais a partir d’un champ envoye par le navigateur. Cela vaut aussi pour la connexion WebSocket.
    - Droits d’acces au chat des joueurs et a celui des spectateurs, verifies a chaque message et pas seulement a l’entree.
    - Temps reel (WebSocket) : diffuser chaque nouveau message, aussitot enregistre, aux participants connectes a ce chat, et gerer proprement les connexions et deconnexions.
    - Securite et finitions : limiter le debit (anti-spam, max 5 message toutes les 10 sec par user), fermer les routes qui ne doivent pas etre publiques, et decider du sort du chat e la fin d’une partie (conserve ou supprime).

### Communication avec le backend
- [x] Adapter l’utilitaire `fetchAPI` à partir du modèle de Noa.
- [x] Activer les types et définir `APIError`.
- [x] Confirmer l’utilisation de `/api` avec le proxy existant.
- [x] Implémenter l’envoi JSON et l’option pour les cookies de session.
- [x] Implémenter le traitement des réponses, y compris sans contenu, et des erreurs.
- [x] Tester une erreur de validation renvoyée par le backend.
- [ ] Tester une réponse réussie et les cookies de session.
- [ ] Tester le logout sans contenu.
- [ ] Tester les erreurs réseau et les erreurs renvoyées sous forme de chaîne JSON.
- [ ] Retirer la page temporaire ApiTest et sa route après les tests.

### Internationalisation
- [ ] Brancher les traductions en français, anglais et espagnol.

### Si le temps le permet
- [ ] Ajouter le parcours « Mot de passe oublié », avec le backend.


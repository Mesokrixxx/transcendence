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
- `src/services/fetchAPI.ts` : exemple de structure pour la future fonction commune d'appels HTTP.
- `src/types/fetch.ts` : types TypeScript fournis par Noa pour les appels API (en commentaire, à finaliser).

Les composants migrés vers Styled Components utilisent
un fichier `.styles.ts` à côté de leur fichier `.tsx`.

## Communication avec le backend

Les appels HTTP du frontend vers le backend devront passer par une fonction commune `fetchAPI`, selon le modèle proposé par Noa.

Un exemple de cette fonction est conservé dans `src/services/fetchAPI.ts`. Il sert de référence pour l'équipe frontend, mais n'est pas encore opérationnel.

Le fichier `src/types/fetch.ts` contient les types proposés par Noa : `Method`, `RequestOptions`, `APIResponse`, `SuccessfulResponse` et `ErrorResponse`.

Ces définitions sont actuellement conservées en commentaire. Le type `APIError` reste à définir selon la structure des erreurs du backend.

La fonction `fetchAPI` et ses types devront être activés, adaptés et testés lors de l'intégration avec le backend.

La future fonction devra centraliser :
- L'URL de l'API, récupérée depuis la variable d'environnement `VITE_API_URL`.
- Les méthodes HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, selon les besoins).
- L'envoi de données au format JSON.
- L'utilisation de `credentials: 'include'` pour les requêtes nécessitant des cookies.
- La gestion des réponses et des erreurs.

Une fois l'utilitaire finalisé, les pages et composants devront l'utiliser plutôt que multiplier les appels `fetch()` directs.

L'intégration au backend reste à réaliser et à tester.

## Pages réalisées

- `Home` : landing page avec titre, bouton Get Started et échiquier.
- `Login` : formulaire de connexion.
- `Register` : formulaire d'inscription avec validation du mot de passe.
- `Profile` : interface du profil joueur avec avatar et bouton Edit.
- `Rankings` : classement des joueurs, développé par un membre de l'équipe.
- `PrivacyPolicy` : politique de confidentialité.
- `TermsOfService` : conditions d'utilisation et crédits.

L'intégration des données du backend et certaines fonctionnalités restent à finaliser.

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
- [x] Ajouter et tester l'effet de sélection des pièces d'échecs.
- [x] Créer les formulaires d'inscription et de connexion.
- [x] Afficher les critères du mot de passe pendant la saisie.
- [x] Vérifier la confirmation du mot de passe.
- [x] Ajouter l'œil pour afficher ou masquer les mots de passe.
- [x] Bloquer l'inscription si les critères du mot de passe ne sont pas respectés.
- [ ] Relier les formulaires d'inscription et de connexion au backend via `fetchAPI`, et gérer les messages d'erreur ou de confirmation.

### Échiquier et logique de jeu
- [ ] Rendre l'échiquier responsive et adapter sa taille aux différentes résolutions d'écran (Mac et écrans de l'école).
- [ ] Intégrer la logique du jeu d'échecs développée par Noa (`chessgame`).
- [x] Créer le composant `GameStatus`.
- [ ] Connecter les interactions de l'échiquier frontend aux déplacements et aux règles du jeu.
- [ ] Synchroniser les parties entre les joueurs.

### Espace joueur
- [ ] Finaliser l'espace joueur.
- [ ] Finaliser le profil avec avatar, pseudo, prénom, nom, statistiques et historique des matchs.
- [x] Créer le composant Avatar réutilisable.
- [x] Ajouter le bouton `Edit` au profil joueur.
- [x] Ajouter la possibilité de changer l'avatar dans l'interface.
- [ ] Ajouter les champs facultatifs prénom et nom au profil joueur.
- [ ] Finaliser le formulaire de modification du profil accessible depuis le bouton `Edit`.
- [ ] Permettre de modifier le pseudo, le prénom et le nom.
- [ ] Relier les modifications du profil et de l'avatar au backend.
- [ ] Afficher les messages de confirmation et d'erreur lors des modifications du profil.

### Liste d'amis
- [ ] Afficher la liste d'amis avec leur avatar, pseudo et statut de connexion.
- [ ] Permettre d'envoyer, d'accepter et de refuser les demandes d'amis.
- [ ] Permettre de supprimer un ami de sa liste.
- [ ] Relier la gestion des amis au backend.

### Classement et communication
- [x] Créer le classement des joueurs (ranking).


    #### ce dont ranking a besoin cote backend
        - Une route qui envoie la liste des joeurs triee
            format suggere : [{id, username, wins, games, avatar, rating, isOnline}]
        - classement par victoire ou par Elo (score de niveau, selon resultat et niv de l'adversaire)?
- [x] Intégrer le composant Avatar au ranking.

- [ ] Ajouter le chat entre joueurs.

#### ce dont ranking a besoin cote backend
    - Une route qui envoie la liste des joeurs triee
        format suggere : [{id, username, wins, games}]
    - classement par victoire ou par Elo (score de niveau, selon resultat et niv de l'adversaire)?

#### ce dont chat a besoin cote backend
    - Enregistrer les messages en base, et renvoyer l’historique a quelqu’un qui arrive dans un chat (route ou inclusion dans la reponse existante : a decider ensemble).
    - Valider le format des messages (pas vide, longueur maximale).
    - Identifier l’auteur cote serveur (via un jeton), jamais a partir d’un champ envoye par le navigateur. Cela vaut aussi pour la connexion WebSocket.
    - Droits d’acces au chat des joueurs et a celui des spectateurs, verifies a chaque message et pas seulement a l’entree.
    - Temps reel (WebSocket) : diffuser chaque nouveau message, aussitot enregistre, aux participants connectes a ce chat, et gerer proprement les connexions et deconnexions.
    - Securite et finitions : limiter le debit (anti-spam, max 5 message toutes les 10 sec par user), fermer les routes qui ne doivent pas etre publiques, et decider du sort du chat e la fin d’une partie (conserve ou supprime).

### Communication avec le backend
- [ ] Finaliser et tester l'utilitaire commun `fetchAPI` à partir du modèle proposé par Noa.

### Internationalisation
- [ ] Brancher les traductions en français, anglais et espagnol.

### Si le temps le permet
- [ ] Ajouter le parcours « Mot de passe oublié », avec le backend.

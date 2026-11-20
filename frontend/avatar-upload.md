# Photo de profil

Un joueur connecté peut choisir une photo dans **Profil → Modifier le profil**.
L’aperçu s’affiche immédiatement. Le fichier est envoyé au serveur uniquement
au clic sur **Enregistrer**. Si le joueur annule, la photo enregistrée reste
inchangée.

## Dépendances ajoutées au backend

| Dépendance | Rôle |
| --- | --- |
| `multer` | Lit la requête `multipart/form-data` et récupère le fichier du champ `avatar`. Il limite l’envoi à un fichier de 2 Mio maximum. |
| `sharp` | Lit l’image, vérifie son format et la redimensionne en WebP de 256 × 256 pixels avant de l’enregistrer. |
| `@types/multer` | Fournit à TypeScript les types de Multer, dont `req.file`. C’est une dépendance de développement. |

Commandes utilisées pour ajouter ces dépendances, depuis la racine du dépôt :

```bash
npm --prefix backend install multer sharp
npm --prefix backend install --save-dev @types/multer
```

Ces commandes ont mis à jour `backend/package.json` et `backend/package-lock.json`.
Une fois ces fichiers commités, l’équipe n’a pas besoin de réinstaller les paquets
un par un : la construction du conteneur backend lance déjà `npm ci`.

## Comment ça marche

1. **Frontend** : `frontend/src/services/avatar.ts` envoie la photo dans un
   `FormData` à `POST /api/users/me/avatar`. Cette fonction est dédiée à l’avatar ;
   le service `fetchAPI` utilisé par les requêtes JSON reste inchangé.
2. **Backend** : la route vérifie que le joueur est connecté. Multer reçoit
   un fichier de 2 Mio maximum. Sharp vérifie que l’image est lisible,
   accepte les formats JPEG, PNG et WebP, puis la convertit en WebP de 256 × 256.
3. **Stockage** : le fichier est écrit dans `/app/uploads/avatars`, un dossier
   du backend monté sur le volume Podman `avatars_data`. PostgreSQL conserve
   uniquement son URL, par exemple `/api/avatars/<id>.webp`, dans le champ
   `Profile.avatar` déjà existant. Aucun changement de schéma Prisma.
4. **Affichage** : `app.ts` associe les URL `/api/avatars/…` au dossier des
   images. Après l’envoi, le frontend utilise l’URL renvoyée pour mettre à jour
   le profil et la barre de navigation. Après un rechargement, `/api/auth/me`
   renvoie l’URL enregistrée.

## Pourquoi modifier Nginx ?

Nginx accepte une requête de 3 Mio maximum sur `/api`. Cela laisse de la place
pour les données du formulaire qui accompagnent le fichier. La limite de
**2 Mio pour la photo elle-même** reste appliquée par le backend.

## Vérification en local

- Choisir une photo et vérifier que l’aperçu s’affiche avant l’enregistrement.
- Enregistrer la photo, elle doit apparaître sur le
  profil et dans la barre de navigation.
- Recharger la page : la même photo doit rester visible.
- Choisir une autre photo, puis annuler : la photo enregistrée doit rester.
- Essayer un fichier trop lourd ou un format non accepté : la photo
  enregistrée doit rester inchangée.
- Vérifier qu’un compte sans photo affiche l’avatar par défaut.
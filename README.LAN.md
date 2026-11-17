# Jouer à deux sur un réseau LAN

L'architecture actuelle utilise une base PostgreSQL et un backend WebSocket
communs. Pour jouer entre deux machines :

1. Lancez toute la stack (`make`) sur une seule machine du réseau. Cette
   machine est l'hôte du backend et de la base de données.
2. Trouvez son adresse IP locale, par exemple avec `ip addr` (ubuntu), `ipconfig` (windows), etc.
3. Depuis chaque machine connectée au même réseau LAN, ouvrez :

   ```text
   https://IP_DE_L_HOTE:4243
   ```

   Remplacez `IP_DE_L_HOTE` par l'adresse IP de la machine qui exécute
   `make`, par exemple `https://192.168.1.20:4243`.
4. Connectez les deux utilisateurs et rejoignez la même partie.

Les deux clients utilisent ainsi le même backend, la même base de données et
les mêmes WebSockets. Il ne faut pas lancer une stack complète sur chaque
machine : cela créerait des backends et des bases séparés. Le certificat HTTPS
étant généré localement, le navigateur peut afficher un avertissement de
certificat lors de la première connexion.

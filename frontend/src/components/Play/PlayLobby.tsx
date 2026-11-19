import { useEffect, useState } from 'react';
import ChessGame from '../../../../chessgame/src/chessgame';
import Avatar from '../../components/Avatar/Avatar';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import { getFriends, type FriendUser } from '../../services/friends';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import { Page } from '../../pages/Home/Home.styles';
import { PlayContent, GameArea, GameInfo } from '../../pages/Play/Play.styles';

export default function PlayLobby() {
  const [board] = useState(() => new ChessGame().getBoard());
  const [friends, setFriends] = useState<FriendUser[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const [presence, setPresence] = useState(new Map<number, boolean>());

  useEffect(() => {
    let active = true;

    void getFriends()
      .then((data) => {
        if (active) setFriends(data.friends);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function updatePresence(event: RealtimeEvent) {
      if (event.type === 'presence.snapshot' && Array.isArray(event.users)) {
        const next = new Map<number, boolean>();

        for (const user of event.users) {
          if (
            user &&
            typeof user === 'object' &&
            'userId' in user &&
            'online' in user &&
            typeof user.userId === 'number' &&
            typeof user.online === 'boolean'
          ) {
            next.set(user.userId, user.online);
          }
        }

        setPresence(next);
      }

      if (
        event.type === 'presence.changed' &&
        typeof event.userId === 'number' &&
        typeof event.online === 'boolean'
      ) {
        const { userId, online } = event;
        setPresence((current) => new Map(current).set(userId, online));
      }
    }

    return realtimeSocket.subscribe(updatePresence);
  }, []);

  const visibleFriends = (friends ?? [])
    .map((friend) => ({
      ...friend,
      isOnline: presence.get(friend.id) ?? friend.isOnline ?? false,
      name: friend.displayName?.trim() || friend.username,
    }))
    .sort(
      (a, b) => Number(b.isOnline) - Number(a.isOnline) ||
        a.name.localeCompare(b.name),
    );

  return (
    <Page>
      <Navbar />

      <PlayContent className="container">
        <GameArea aria-label="Jouer avec un ami">
          <GameInfo>
            <h1>Jouer avec un ami</h1>

            {hasError ? (
              <p role="alert">Impossible de charger tes amis.</p>
            ) : friends === null ? (
              <p role="status">Chargement de tes amis…</p>
            ) : visibleFriends.length === 0 ? (
              <p>Tu n’as pas encore d’amis dans ChessMove.</p>
            ) : (
              <ul>
                {visibleFriends.map((friend) => (
                  <li key={friend.id} className="opponent">
                    <Avatar
                      src={friend.avatar ?? ''}
                      username={friend.name}
                      isOnline={friend.isOnline}
                      size={40}
                    />
                    <span>{friend.name}</span>
                    <span>{friend.isOnline ? 'En ligne' : 'Hors ligne'}</span>
                  </li>
                ))}
              </ul>
            )}
          </GameInfo>

          <ChessBoard
            board={board}
            orientation="white"
            selectedSquare={null}
            onSquareClick={() => {}}
            legalMoves={[]}
            disabled
          />
        </GameArea>
      </PlayContent>

      <Footer />
    </Page>
  );
}
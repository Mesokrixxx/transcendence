import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChessGame from '../../../../chessgame/src/chessgame';
import Avatar from '../../components/Avatar/Avatar';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import { getFriends, type FriendUser } from '../../services/friends';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import fetchAPI from '../../services/fetchAPI';
import { Page } from '../../pages/Home/Home.styles';
import { PlayContent, GameArea, GameInfo } from '../../pages/Play/Play.styles';

export default function PlayLobby() {
  const navigate = useNavigate();
  const [board] = useState(() => new ChessGame().getBoard());
  const [friends, setFriends] = useState<FriendUser[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const [presence, setPresence] = useState(new Map<number, boolean>());
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [confirmFriendId, setConfirmFriendId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  async function handleFriendSelected(friendId: number) {
    setSelectedFriendId(friendId);
    setActionError('');
  }

  async function handlePlay() {
    if (selectedFriendId === null || isSending) return;

    setIsSending(true);
    setActionError('');
    try {
      const activeResponse = await fetchAPI<{ id: number } | null>({
        path: `/games/active/${selectedFriendId}`,
        method: 'get',
      });
      if (activeResponse.error) throw new Error('Impossible de vérifier la partie.');
      if (activeResponse.result) {
        navigate(`/play/${activeResponse.result.id}`);
        return;
      }
      setConfirmFriendId(selectedFriendId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de lancer la partie.');
    } finally {
      setIsSending(false);
    }
  }

  async function sendInvitation(friendId: number) {
    setIsSending(true);
    setActionError('');
    try {
      const invitationResponse = await fetchAPI<{ invitationId?: number; gameId?: number }>({
        path: `/games/invitations/${friendId}`,
        method: 'post',
      });
      if (invitationResponse.error) throw new Error('Impossible d’envoyer la demande.');
      if (invitationResponse.result.gameId) {
        navigate(`/play/${invitationResponse.result.gameId}`);
        return;
      }
      setConfirmFriendId(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible d’envoyer la demande.');
    } finally {
      setIsSending(false);
    }
  }

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
              <>
                <label htmlFor="friend-game-select">Choisir un ami</label>
                <select
                  id="friend-game-select"
                  value={selectedFriendId ?? ''}
                  onChange={(event) => void handleFriendSelected(Number(event.target.value))}
                >
                  <option value="" disabled>Sélectionner un ami</option>
                  {visibleFriends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name} — {friend.isOnline ? 'En ligne' : 'Hors ligne'}
                    </option>
                  ))}
                </select>

                {selectedFriendId !== null &&
                  (() => {
                    const friend = visibleFriends.find((item) => item.id === selectedFriendId);
                    return friend ? (
                      <div className="opponent">
                        <Avatar
                          src={friend.avatar ?? ''}
                          username={friend.name}
                          isOnline={friend.isOnline}
                          size={40}
                        />
                        <span>{friend.name}</span>
                      </div>
                    ) : null;
                  })()}

                <button
                  type="button"
                  disabled={selectedFriendId === null || isSending}
                  onClick={() => void handlePlay()}
                >
                  {isSending ? 'Envoi…' : 'Envoyer une demande de partie'}
                </button>
                {confirmFriendId !== null &&
                  (() => {
                    const friend = visibleFriends.find((item) => item.id === confirmFriendId);
                    return (
                      <div role="dialog" aria-label="Confirmation de demande de partie">
                        <p>
                          Es-tu sûr de vouloir envoyer une demande de partie à{' '}
                          {friend?.name ?? 'cet ami'} ?
                        </p>
                        <button
                          type="button"
                          disabled={isSending}
                          onClick={() => void sendInvitation(confirmFriendId)}
                        >
                          Oui
                        </button>
                        <button
                          type="button"
                          disabled={isSending}
                          onClick={() => setConfirmFriendId(null)}
                        >
                          Non
                        </button>
                      </div>
                    );
                  })()}
                {actionError && <p role="alert">{actionError}</p>}
              </>
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
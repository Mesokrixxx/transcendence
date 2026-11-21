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
import { useTranslation } from 'react-i18next';
import { PlayContent, GameArea, GameInfo } from '../../pages/Play/Play.styles';
import Button from '../../components/Button/Button';
import { FriendSelect, ConfirmationDialog } from './PlayLobby.styles';

export default function PlayLobby() {
  const { t } = useTranslation('chess');
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
      if (activeResponse.error) throw new Error(t('lobby.checkError'));
      if (activeResponse.result) {
        navigate(`/play/${activeResponse.result.id}`);
        return;
      }
      setConfirmFriendId(selectedFriendId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('lobby.startError'));
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
      if (invitationResponse.error) throw new Error(t('lobby.sendError'));
      if (invitationResponse.result.gameId) {
        navigate(`/play/${invitationResponse.result.gameId}`);
        return;
      }
      setConfirmFriendId(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('lobby.sendError'));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Page>
      <Navbar />

      <PlayContent className="container">
        <GameArea aria-label={t('lobby.title')}>
          <GameInfo>
            <h1>{t('lobby.title')}</h1>

            {hasError ? (
              <p role="alert">{t('lobby.loadError')}</p>
            ) : friends === null ? (
              <p role="status">{t('lobby.loading')}</p>
            ) : visibleFriends.length === 0 ? (
              <p>{t('lobby.noFriends')}</p>
            ) : (
              <>
                <label htmlFor="friend-game-select">{t('lobby.chooseFriend')}</label>
                <FriendSelect
                  id="friend-game-select"
                  value={selectedFriendId ?? ''}
                  onChange={(event) => void handleFriendSelected(Number(event.target.value))}
                >
                  <option value="" disabled>{t('lobby.selectFriend')}</option>
                  {visibleFriends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name} — {friend.isOnline ? t('lobby.online') : t('lobby.offline')}
                    </option>
                  ))}
                </FriendSelect>

                {selectedFriendId !== null &&
                  (() => {
                    const friend = visibleFriends.find((item) => item.id === selectedFriendId);
                    return friend ? (
                      <div className="opponent">
                        <Avatar
                          src={friend.avatar || '/avatars/default.svg'}
                          username={friend.name}
                          isOnline={friend.isOnline}
                          size={40}
                        />
                        <span>{friend.name}</span>
                      </div>
                    ) : null;
                  })()}

                <Button
                  variant="primary"
                  onClick={() => void handlePlay()}
                >
                  {isSending ? t('lobby.sending') : t('lobby.sendRequest')}
                </Button>
                {confirmFriendId !== null &&
                  (() => {
                    const friend = visibleFriends.find((item) => item.id === confirmFriendId);
                    return (
                      <ConfirmationDialog role="dialog" aria-label={t('lobby.confirmTitle')}>
                        <p>
                          {t('lobby.confirmMessage', {
                            name: friend?.name ?? t('lobby.thisFriend'),
                          })}
                        </p>
                        <div>
                          <button
                            type="button"
                            disabled={isSending}
                            onClick={() => void sendInvitation(confirmFriendId)}
                          >
                            {t('yes', { ns: 'common' })}
                          </button>
                          <button
                            type="button"
                            disabled={isSending}
                            onClick={() => setConfirmFriendId(null)}
                          >
                            {t('no', { ns: 'common' })}
                          </button>
                        </div>
                      </ConfirmationDialog>
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChessGame from '../../../../chessgame/src/chessgame';
import Avatar from '../../components/Avatar/Avatar';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import { getFriends, type FriendUser } from '../../services/friends';
import { useFriendPresence } from '../../hooks/useFriendPresence';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import fetchAPI from '../../services/fetchAPI';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../pages/Home/Home.styles';
import { useTranslation } from 'react-i18next';
import { PlayContent, GameArea, GameInfo } from '../../pages/Play/Play.styles';
import Button from '../../components/Button/Button';
import { FriendSelect, ConfirmationDialog } from './PlayLobby.styles';

type ActiveGame = {
  id: number;
  whiteId: number;
  blackId: number;
  isPlayer: boolean;
};

export default function PlayLobby() {
  const { t } = useTranslation('chess');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [board] = useState(() => new ChessGame().getBoard());
  const [friends, setFriends] = useState<FriendUser[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const presence = useFriendPresence();
  const [activeGames, setActiveGames] = useState(new Map<number, number>());
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
    function updateProfile(event: RealtimeEvent) {
      if (
        event.type !== 'profile.changed' ||
        typeof event.userId !== 'number' ||
        typeof event.username !== 'string' ||
        (event.avatar !== null && typeof event.avatar !== 'string') ||
        (event.displayName !== null && typeof event.displayName !== 'string')
      )
        return;

      const { userId, username, avatar, displayName } = event;
      setFriends((current) =>
        current
          ? current.map((friend) =>
              friend.id === userId
                ? {
                    ...friend,
                    username,
                    avatar: typeof avatar === 'string' ? avatar : undefined,
                    displayName,
                  }
                : friend,
            )
          : current,
      );
    }

    return realtimeSocket.subscribe(updateProfile);
  }, []);

  useEffect(() => {
    const currentUserId = user?.id;
    if (currentUserId === undefined) return;

    let active = true;

    async function loadActiveGames() {
      const response = await fetchAPI<{ games: ActiveGame[] }>({
        path: '/games',
        method: 'get',
      });
      if (!active || response.error) return;

      const next = new Map<number, number>();
      for (const game of response.result.games) {
        if (!game.isPlayer) continue;
        const friendId =
          game.whiteId === currentUserId ? game.blackId : game.whiteId;
        if (friendId === currentUserId || next.has(friendId)) continue;
        next.set(friendId, game.id);
      }
      setActiveGames(next);
    }

    void loadActiveGames();
    const interval = window.setInterval(() => {
      void loadActiveGames();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [user?.id]);

  const allFriends = (friends ?? [])
    .map((friend) => ({
      ...friend,
      isOnline: presence.get(friend.id) ?? friend.isOnline ?? false,
      name: friend.displayName?.trim() || friend.username,
      activeGameId: activeGames.get(friend.id),
    }))
    .sort(
      (a, b) =>
        Number(b.isOnline) - Number(a.isOnline) ||
        Number(b.activeGameId !== undefined) -
          Number(a.activeGameId !== undefined) ||
        a.name.localeCompare(b.name),
    );

  const visibleFriends = allFriends.filter(
    (friend) => friend.isOnline || friend.activeGameId !== undefined,
  );
  const selectedFriend = visibleFriends.find(
    (friend) => friend.id === selectedFriendId,
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
      setActionError(
        error instanceof Error ? error.message : t('lobby.startError'),
      );
    } finally {
      setIsSending(false);
    }
  }

  async function sendInvitation(friendId: number) {
    setIsSending(true);
    setActionError('');
    try {
      const invitationResponse = await fetchAPI<{
        invitationId?: number;
        gameId?: number;
      }>({
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
      setActionError(
        error instanceof Error ? error.message : t('lobby.sendError'),
      );
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
            ) : friends.length === 0 ? (
              <p>{t('lobby.noFriends')}</p>
            ) : visibleFriends.length === 0 ? (
              <p>{t('lobby.noOnlineFriends')}</p>
            ) : (
              <>
                <label htmlFor="friend-game-select">
                  {t('lobby.chooseFriend')}
                </label>
                <FriendSelect
                  id="friend-game-select"
                  value={selectedFriendId ?? ''}
                  onChange={(event) =>
                    void handleFriendSelected(Number(event.target.value))
                  }
                >
                  <option value="" disabled>
                    {t('lobby.selectFriend')}
                  </option>
                  {visibleFriends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.name}
                      {friend.activeGameId !== undefined
                        ? ` (${t('lobby.activeGame')})`
                        : ''}
                      {friend.isOnline ? ` — ${t('lobby.online')}` : ''}
                    </option>
                  ))}
                </FriendSelect>

                {selectedFriend && (
                  <div className="opponent">
                    <Avatar
                      src={selectedFriend.avatar || '/avatars/default.svg'}
                      username={selectedFriend.name}
                      isOnline={selectedFriend.isOnline}
                      size={40}
                    />
                    <span>{selectedFriend.name}</span>
                  </div>
                )}

                {selectedFriend?.activeGameId !== undefined ? (
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(`/play/${selectedFriend.activeGameId}`)
                    }
                  >
                    {t('lobby.joinActiveGame')}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => void handlePlay()}>
                    {isSending ? t('lobby.sending') : t('lobby.sendRequest')}
                  </Button>
                )}
                {confirmFriendId !== null &&
                  (() => {
                    const friend = visibleFriends.find(
                      (item) => item.id === confirmFriendId,
                    );
                    return (
                      <ConfirmationDialog
                        role="dialog"
                        aria-label={t('lobby.confirmTitle')}
                      >
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

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChessGame from '../../../chessgame/src/chessgame';
import type { Move } from '../../../chessgame/src/chessgame.types';
import { useAuth } from '../context/AuthContext';
import fetchAPI from '../services/fetchAPI';
import { getFriends } from '../services/friends';
import realtimeSocket, { type RealtimeEvent } from '../services/websocket';
import { useFriendPresence } from './useFriendPresence';

type GameStatus = 'WAITING' | 'PLAYING' | 'OVER';
type GameResult = 'DRAW' | 'WHITE' | 'BLACK' | null;
type GamePlayer = {
  id: number;
  username?: string;
  displayName?: string | null;
  avatar?: string | null;
};

type RemoteGameState = {
  moves: Move[];
  chatId?: number;
  status?: GameStatus;
  result?: GameResult;
  white?: GamePlayer;
  black?: GamePlayer;
  whiteId?: number;
  blackId?: number;
};

type OnlineSide = {
  playerColor: 'white' | 'black';
  opponentId: number | undefined;
  opponentName: string | null;
  opponentAvatar: string | null;
  chatId: number | undefined;
};

function isRemoteGameState(value: unknown): value is RemoteGameState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'moves' in value &&
    Array.isArray(value.moves)
  );
}

function readPosition(state: RemoteGameState, defaultStatus: GameStatus) {
  const { status, result } = state;
  return {
    game: new ChessGame(state.moves),
    status:
      status === 'WAITING' || status === 'PLAYING' || status === 'OVER'
        ? status
        : defaultStatus,
    result: result === 'DRAW' || result === 'WHITE' || result === 'BLACK'
      ? result
      : null,
  };
}

function apiErrorMessage(value: unknown, fallback: string) {
  if (typeof value === 'string') return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'string'
  ) {
    return value.error;
  }
  return fallback;
}

export function useOnlineGame(
  gameId: number | undefined,
  onPositionChanged: () => void,
) {
  const { t } = useTranslation('chess');
  const { user } = useAuth();
  const userId = user?.id;
  const [side, setSide] = useState<OnlineSide | null>(null);
  const [position, setPosition] = useState(() =>
    readPosition({ moves: [] }, 'WAITING'),
  );
  const [bothPlayersPresent, setBothPlayersPresent] = useState(false);
  const friendPresence = useFriendPresence(gameId !== undefined && userId != null);
  const [initialFriendPresence, setInitialFriendPresence] = useState(
    () => new Map<number, boolean>(),
  );
  const [drawRequestSent, setDrawRequestSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gameId === undefined || userId == null) return;

    let active = true;

    void getFriends()
      .then(({ friends }) => {
        if (!active) return;

        setInitialFriendPresence(new Map(
          friends.map((friend) => [friend.id, friend.isOnline ?? false]),
        ));
      })
      .catch(() => {
        // Presence can still be received over the WebSocket.
      });

    void fetchAPI<RemoteGameState>({
      path: `/games/${gameId}`,
      method: 'get',
    }).then((response) => {
      if (!active) return;

      if (response.error || !isRemoteGameState(response.result)) {
        setError(apiErrorMessage(response.result, t('unableToPlayThisMove')));
        return;
      }

      const state = response.result;
      const whiteId = state.white?.id ?? state.whiteId;
      const blackId = state.black?.id ?? state.blackId;
      const playerColor =
        userId === whiteId ? 'white' : userId === blackId ? 'black' : null;

      if (playerColor === null) {
        setError(t('unableToPlayThisMove'));
        return;
      }

      const opponent = playerColor === 'white' ? state.black : state.white;
      setSide({
        playerColor,
        opponentId: playerColor === 'white' ? blackId : whiteId,
        opponentName: opponent?.displayName?.trim() || opponent?.username || null,
        opponentAvatar: opponent?.avatar ?? null,
        chatId: state.chatId,
      });
      setPosition(readPosition(state, 'PLAYING'));
    });

    function handleGameEvent(event: RealtimeEvent) {
      if (event.type === 'game.draw.declined' && event.gameId === gameId) {
        setDrawRequestSent(false);
        setError(t('drawRequestDeclined'));
        return;
      }

      if (event.type === 'game.presence') {
        if (
          event.gameId === gameId &&
          typeof event.bothPlayersPresent === 'boolean'
        ) {
          setBothPlayersPresent(event.bothPlayersPresent);
        }
        return;
      }

      if (event.type !== 'game.updated' || !isRemoteGameState(event.game)) return;

      setPosition(readPosition(event.game, 'PLAYING'));
      onPositionChanged();
    }

    const leaveGame = realtimeSocket.joinGame(gameId, handleGameEvent);
    return () => {
      active = false;
      leaveGame();
    };
  }, [gameId, onPositionChanged, t, userId]);

  async function playMove(move: Move) {
    if (gameId === undefined) return;

    try {
      const response = await fetchAPI<RemoteGameState>({
        path: `/games/${gameId}/moves`,
        method: 'post',
        body: move,
      });

      if (response.error || !isRemoteGameState(response.result)) {
        setError(apiErrorMessage(response.result, t('unableToPlayThisMove')));
        return;
      }

      setPosition(readPosition(response.result, 'PLAYING'));
      onPositionChanged();
      setError('');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('unableToPlayThisMove'));
    }
  }

  async function offerDraw() {
    if (gameId === undefined) return;

    const response = await fetchAPI<{ gameId: number }>({
      path: `/games/${gameId}/draw/request`,
      method: 'post',
    });
    if (response.error) {
      setError(apiErrorMessage(response.result, t('unableToSendDrawRequest')));
      return;
    }

    setError('');
    setDrawRequestSent(true);
  }

  async function resign() {
    if (gameId === undefined) return;

    const response = await fetchAPI<RemoteGameState>({
      path: `/games/${gameId}/resign`,
      method: 'post',
    });
    if (response.error || !isRemoteGameState(response.result)) {
      setError(t('unableToPlayThisMove'));
      return;
    }

    setPosition(readPosition(response.result, 'OVER'));
    onPositionChanged();
    setError('');
  }

  const opponentId = side?.opponentId;
  const opponentIsOnline = opponentId === undefined
    ? bothPlayersPresent
    : friendPresence.get(opponentId) ??
      initialFriendPresence.get(opponentId) ??
      bothPlayersPresent;

  return {
    ...position,
    side,
    bothPlayersPresent,
    opponentIsOnline,
    drawRequestSent,
    error,
    clearError: () => setError(''),
    playMove,
    offerDraw,
    resign,
  };
}

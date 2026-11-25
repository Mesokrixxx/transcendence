import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChessGame from '../../../../chessgame/src/chessgame';
import type { Move } from '../../../../chessgame/src/chessgame.types';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Avatar from '../../components/Avatar/Avatar';
import GameStatus from '../../components/GameStatus/GameStatus';
import ChatBox from '../../components/ChatBox/ChatBox';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import {
  PlayContent as WatchContent,
  GameArea,
  GameInfo,
  GameChat,
} from '../Play/Play.styles';
import { useTranslation } from 'react-i18next';
import fetchAPI from '../../services/fetchAPI';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';

type Player = {
  id: number;
  username: string;
  avatar: string | null;
};

type RemoteStatus = 'WAITING' | 'PLAYING' | 'OVER';
type RemoteResult = 'DRAW' | 'WHITE' | 'BLACK' | null;

type GameState = {
  moves: Move[];
  specChatId: number;
  status?: RemoteStatus;
  result?: RemoteResult;
  endType?: string | null;
  white: Player;
  black: Player;
};

type GameUpdate = {
  moves: Move[];
  status?: unknown;
  result?: unknown;
  endType?: unknown;
  specChatId?: unknown;
  white?: unknown;
  black?: unknown;
};

function readRemoteStatus(value: unknown): RemoteStatus | undefined {
  return value === 'WAITING' || value === 'PLAYING' || value === 'OVER'
    ? value
    : undefined;
}

function readRemoteResult(value: unknown): RemoteResult {
  return value === 'DRAW' || value === 'WHITE' || value === 'BLACK'
    ? value
    : null;
}

function isGameState(value: unknown): value is GameState {
  if (!isGameUpdate(value)) return false;

  const game = value;
  const isPlayer = (player: unknown): player is Player =>
    typeof player === 'object' &&
    player !== null &&
    'id' in player &&
    'username' in player &&
    'avatar' in player &&
    typeof player.id === 'number' &&
    typeof player.username === 'string' &&
    (player.avatar === null || typeof player.avatar === 'string');

  return (
    Array.isArray(game.moves) &&
    typeof game.specChatId === 'number' &&
    isPlayer(game.white) &&
    isPlayer(game.black)
  );
}

function isGameUpdate(value: unknown): value is GameUpdate {
  return (
    typeof value === 'object' &&
    value !== null &&
    'moves' in value &&
    Array.isArray(value.moves)
  );
}

function WatchGame() {
  const { gameId: gameIdParam } = useParams();
  const { t } = useTranslation();
  const [game, setGame] = useState(() => new ChessGame());
  const [players, setPlayers] = useState<GameState | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus | undefined>();
  const [remoteResult, setRemoteResult] = useState<RemoteResult>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [error, setError] = useState('');
  const gameId = Number(gameIdParam);
  const isValidGameId = Number.isInteger(gameId) && gameId > 0;

  useEffect(() => {
    if (!isValidGameId) {
      setError(t('gameNotFound', { ns: 'chess' }));
      return;
    }

    let active = true;

    fetchAPI<GameState>({
      path: `/games/${gameId}`,
      method: 'get',
    }).then((response) => {
      if (!active) return;
      if (response.error || !isGameState(response.result)) {
        setError(t('gameNotFound', { ns: 'chess' }));
        return;
      }
      setPlayers(response.result);
      setGame(new ChessGame(response.result.moves));
      setRemoteStatus(readRemoteStatus(response.result.status));
      setRemoteResult(readRemoteResult(response.result.result));
      setError('');
    });

    function handleGameEvent(event: RealtimeEvent) {
      if (
        event.type === 'profile.changed' &&
        typeof event.userId === 'number' &&
        typeof event.username === 'string' &&
        (event.avatar === null || typeof event.avatar === 'string')
      ) {
        const { userId: changedUserId, username, avatar } = event;
        setPlayers((current) => {
          if (!current) return current;
          if (current.white.id === changedUserId)
            return {
              ...current,
              white: { ...current.white, username, avatar },
            };
          if (current.black.id === changedUserId)
            return {
              ...current,
              black: { ...current.black, username, avatar },
            };
          return current;
        });
        return;
      }

      if (event.type !== 'game.updated' || !isGameUpdate(event.game)) return;

      const update = event.game;
      setGame(new ChessGame(update.moves));
      setRemoteStatus(readRemoteStatus(update.status));
      setRemoteResult(readRemoteResult(update.result));
      if (isGameState(update)) setPlayers(update);
      setError('');
    }

    const leaveGame = realtimeSocket.joinGame(gameId, handleGameEvent);
    return () => {
      active = false;
      leaveGame();
    };
  }, [gameId, isValidGameId, t]);

  function flipBoard() {
    setOrientation((current) => (current === 'white' ? 'black' : 'white'));
  }

  return (
    <Page>
      <Navbar />

      <WatchContent className="container">
        <GameArea aria-label={t('gameForSpectators', { ns: 'chess' })}>
          <GameInfo aria-label={t('gameInformation', { ns: 'chess' })}>
            <div className="opponent">
              <Avatar
                src={players?.white.avatar || '/avatars/default.svg'}
                username={
                  players?.white.username ?? t('playerWhite', { ns: 'chess' })
                }
                size={48}
              />
              <span>
                {t('white', { ns: 'chess' })} —{' '}
                {players?.white.username ?? t('playerWhite', { ns: 'chess' })}
              </span>
            </div>

            <div className="opponent">
              <Avatar
                src={players?.black.avatar || '/avatars/default.svg'}
                username={
                  players?.black.username ?? t('playerBlack', { ns: 'chess' })
                }
                size={48}
              />
              <span>
                {t('black', { ns: 'chess' })} —{' '}
                {players?.black.username ?? t('playerBlack', { ns: 'chess' })}
              </span>
            </div>

            {error && <p role="alert">{error}</p>}

            <Button variant="secondary" onClick={flipBoard}>
              {t('flipBoard', { ns: 'chess' })}
            </Button>

            <GameStatus
              game={game}
              remoteStatus={remoteStatus}
              remoteResult={remoteResult}
            />
          </GameInfo>

          <ChessBoard
            board={game.getBoard()}
            orientation={orientation}
            readOnly
          />

          <GameChat aria-label={t('spectatorChat', { ns: 'chat' })}>
            <ChatBox
              title={t('spectatorChat', { ns: 'chat' })}
              chatId={players?.specChatId}
            />
          </GameChat>
        </GameArea>
      </WatchContent>

      <Footer />
    </Page>
  );
}

export default WatchGame;

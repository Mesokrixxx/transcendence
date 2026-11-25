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

type GameState = {
  moves: Move[];
  specChatId: number;
  white: Player;
  black: Player;
};

function isGameState(value: unknown): value is GameState {
  if (!isGameUpdate(value)) return false;

  const game = value as {
    moves?: unknown;
    specChatId?: unknown;
    white?: unknown;
    black?: unknown;
  };
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

function isGameUpdate(value: unknown): value is { moves: Move[] } {
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
      if (isGameState(event.game)) setPlayers(event.game);
      setGame(new ChessGame(event.game.moves));
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

            <GameStatus game={game} />
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

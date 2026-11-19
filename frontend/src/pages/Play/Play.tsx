import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChessGame from '../../../../chessgame/src/chessgame';
import type {
  Move,
  DeepReadonly,
  Square as SquareName,
} from '../../../../chessgame/src/chessgame.types';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Avatar from '../../components/Avatar/Avatar';
import GameStatus from '../../components/GameStatus/GameStatus';
import ChatBox from '../../components/ChatBox/ChatBox';
import Button from '../../components/Button/Button';
import PlayLobby from '../../components/Play/PlayLobby';
import { Page } from '../Home/Home.styles';
import { PlayContent, GameArea, GameInfo, GameChat } from './Play.styles';
import { useTranslation } from 'react-i18next';
import fetchAPI from '../../services/fetchAPI';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';

type PromotionLabelKey =
  | 'promotionQueen'
  | 'promotionRook'
  | 'promotionBishop'
  | 'promotionKnight';

const promotionLabels: Record<string, PromotionLabelKey> = {
  queen: 'promotionQueen',
  rook: 'promotionRook',
  bishop: 'promotionBishop',
  knight: 'promotionKnight',
};

type RemoteGameState = {
  moves: Move[];
  chatId?: number;
  status?: 'WAITING' | 'PLAYING' | 'OVER';
  result?: 'DRAW' | 'WHITE' | 'BLACK' | null;
  endType?: string | null;
  white?: {
    id: number;
    username?: string;
    displayName?: string | null;
    avatar?: string | null;
  };
  black?: {
    id: number;
    username?: string;
    displayName?: string | null;
    avatar?: string | null;
  };
  whiteId?: number;
  blackId?: number;
};

function isRemoteGameState(value: unknown): value is RemoteGameState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'moves' in value &&
    Array.isArray(value.moves)
  );
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

function Play() {
  const { gameId: gameIdParam } = useParams();
  const [gamePresence, setGamePresence] = useState<{
    gameId: number;
    bothPlayersPresent: boolean;
  } | null>(null);
  const { user } = useAuth();
  const userId = user?.id;
  const [onlineSide, setOnlineSide] = useState<{
    gameId: number;
    playerColor: 'white' | 'black';
    opponentName: string | null;
    opponentAvatar: string | null;
  } | null>(null);
  const { t: tChess } = useTranslation('chess');
  const { t: tCommon } = useTranslation('common');
  const { t: tChat } = useTranslation('chat');
  const [game, setGame] = useState(() => new ChessGame());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isRotating, setIsRotating] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<SquareName | null>(null);
  const [promotionMoves, setPromotionMoves] = useState<Move[]>([]);
  const [error, setError] = useState('');
  const [remoteChatId, setRemoteChatId] = useState<number | null>(null);
  const [remoteOutcome, setRemoteOutcome] = useState<{
    status: 'WAITING' | 'PLAYING' | 'OVER';
    result: 'DRAW' | 'WHITE' | 'BLACK' | null;
    endType: string | null;
  } | null>(null);
  const [drawRequestSent, setDrawRequestSent] = useState(false);

  const gameId = Number(gameIdParam);
  const isRemoteGame = Number.isInteger(gameId) && gameId > 0;
  const boardOrientation = isRemoteGame
    ? (onlineSide?.gameId === gameId ? onlineSide.playerColor : null)
    : orientation;
  const opponentName =
    (isRemoteGame && onlineSide?.gameId === gameId
      ? onlineSide.opponentName
      : null) ?? tChess('opponent');
  const opponentAvatar =
    isRemoteGame && onlineSide?.gameId === gameId
      ? onlineSide.opponentAvatar
      : null;
  const waitingForFriend =
    isRemoteGame &&
    game.getHistory().length === 0 &&
    !(gamePresence?.gameId === gameId && gamePresence.bothPlayersPresent);

  const board = game.getBoard();

  let legalMoves: DeepReadonly<Move[]> = [];
  if (selectedSquare && !isRotating && promotionMoves.length === 0) {
    legalMoves = game.getMoves(selectedSquare);
  }

  useEffect(() => {
    if (isRemoteGame || orientation === game.getTurn()) return;

    const timer = setTimeout(() => {
      setOrientation(game.getTurn());
      setIsRotating(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [game, orientation, isRemoteGame]);

  useEffect(() => {
    if (!isRemoteGame || userId == null) return;

    let active = true;

    fetchAPI<RemoteGameState>({
      path: `/games/${gameId}`,
      method: 'get',
    }).then((response) => {
      if (!active) return;

      if (response.error || !isRemoteGameState(response.result)) {
        setError(apiErrorMessage(response.result, tChess('unableToPlayThisMove')));
        return;
      }

      const whiteId = response.result.white?.id ?? response.result.whiteId;
      const blackId = response.result.black?.id ?? response.result.blackId;
      const playerColor =
        userId === whiteId ? 'white' : userId === blackId ? 'black' : null;

      if (playerColor === null) {
        setError(tChess('unableToPlayThisMove'));
        return;
      }

      const opponent =
        playerColor === 'white' ? response.result.black : response.result.white;

      setOnlineSide({
        gameId,
        playerColor,
        opponentName: opponent?.displayName?.trim() || opponent?.username || null,
        opponentAvatar: opponent?.avatar ?? null,
      });
      setRemoteChatId(
        typeof response.result.chatId === 'number' ? response.result.chatId : null,
      );
      setRemoteOutcome({
        status: response.result.status ?? 'PLAYING',
        result: response.result.result ?? null,
        endType: response.result.endType ?? null,
      });
      setGame(new ChessGame(response.result.moves));
    });

    function handleGameEvent(event: RealtimeEvent) {
      if (event.type === 'game.draw.declined' && event.gameId === gameId) {
        setDrawRequestSent(false);
        setError(tChess('drawRequestDeclined'));
      }
      if (event.type === 'game.presence') {
        if (
          event.gameId === gameId &&
          typeof event.bothPlayersPresent === 'boolean'
        ) {
          setGamePresence({
            gameId,
            bothPlayersPresent: event.bothPlayersPresent,
          });
        }
        return;
      }

      if (
        event.type === 'game.player.left' &&
        event.gameId === gameId &&
        typeof event.userId === 'number'
      ) {
        setGamePresence({
          gameId,
          bothPlayersPresent: false,
        });
        return;
      }

      if (event.type !== 'game.updated' || !isRemoteGameState(event.game)) return;

      setGame(new ChessGame(event.game.moves));
      setRemoteOutcome({
        status:
          typeof event.game.status === 'string'
            ? event.game.status as 'WAITING' | 'PLAYING' | 'OVER'
            : 'PLAYING',
        result:
          event.game.result === 'DRAW' ||
          event.game.result === 'WHITE' ||
          event.game.result === 'BLACK'
            ? event.game.result
            : null,
        endType:
          typeof event.game.endType === 'string' ? event.game.endType : null,
      });
      setSelectedSquare(null);
      setPromotionMoves([]);
      setIsRotating(false);
    }

    const leaveGame = realtimeSocket.joinGame(gameId, handleGameEvent);

    return () => {
      active = false;
      leaveGame();
    };
  }, [gameId, isRemoteGame, tChess, userId]);

  async function playMove(move: Move) {
    try {
      if (isRemoteGame) {
        const response = await fetchAPI<RemoteGameState>({
          path: `/games/${gameId}/moves`,
          method: 'post',
          body: move,
        });

        if (response.error || !isRemoteGameState(response.result)) {
          setError(apiErrorMessage(response.result, tChess('unableToPlayThisMove')));
          return;
        }

        setGame(new ChessGame(response.result.moves));
        setRemoteOutcome({
          status: response.result.status ?? 'PLAYING',
          result: response.result.result ?? null,
          endType: response.result.endType ?? null,
        });
        setSelectedSquare(null);
        setPromotionMoves([]);
        setError('');
        return;
      }

      const nextGame = new ChessGame([...game.getHistory(), move]);

      setGame(nextGame);
      setIsRotating(true);
      setSelectedSquare(null);
      setPromotionMoves([]);
      setError('');
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : tChess('unableToPlayThisMove'),
      );
    }
  }

  async function endRemoteGame(action: 'resign' | 'draw') {
    if (!isRemoteGame) return;

    if (action === 'draw') {
      const response = await fetchAPI<{ gameId: number }>({
        path: `/games/${gameId}/draw/request`,
        method: 'post',
      });
      if (response.error) {
        setError(apiErrorMessage(response.result, tChess('unableToSendDrawRequest')));
        return;
      }
      setError('');
      setDrawRequestSent(true);
      return;
    }

    const response = await fetchAPI<RemoteGameState>({
      path: `/games/${gameId}/${action}`,
      method: 'post',
    });
    if (response.error || !isRemoteGameState(response.result)) {
      setError(tChess('unableToPlayThisMove'));
      return;
    }

    setGame(new ChessGame(response.result.moves));
    setRemoteOutcome({
      status: response.result.status ?? 'OVER',
      result: response.result.result ?? null,
      endType: response.result.endType ?? null,
    });
    setSelectedSquare(null);
    setPromotionMoves([]);
    setError('');
  }

  function handleSquareClick(square: SquareName) {
    if (
      game.isOver() ||
      remoteOutcome?.status === 'OVER' ||
      promotionMoves.length > 0 ||
      isRotating
    ) return;

    setError('');

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (selectedSquare) {
      const moves = game
        .getMoves(selectedSquare)
        .filter((move) => move.to === square);

      if (moves.some((move) => move.promotion !== undefined)) {
        setPromotionMoves(moves);
        return;
      }

      const move = moves[0];

      if (move) {
        playMove(move);
        return;
      }
    }

    const piece = board[square];

    if (piece && piece.color === game.getTurn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }

  if (gameIdParam === undefined) return <PlayLobby />;

  return (
    <Page>
      <Navbar />

      <PlayContent className="container">
        <GameArea aria-label={tChess('localChessGame')}>
          <GameInfo aria-label={tChess('gameInformation')}>
            <div className="opponent">
              <Avatar
                src={opponentAvatar ?? ''}
                username={opponentName}
                size={64}
                isOnline={true}
              />
              <span>{opponentName}</span>
            </div>

            {boardOrientation !== null && (
              <GameStatus
                game={game}
                message={waitingForFriend ? tChess('waitingForFriend') : undefined}
                remoteStatus={remoteOutcome?.status}
                remoteResult={remoteOutcome?.result}
              />
            )}

            {isRemoteGame &&
              remoteOutcome?.status !== 'OVER' &&
              !game.isOver() && (
              <div role="group" aria-label={tChess('gameActions')}>
                <Button
                  variant="secondary"
                  onClick={() => void endRemoteGame('draw')}
                >
                  {drawRequestSent
                    ? tChess('drawRequestSent')
                    : tChess('offerDraw')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void endRemoteGame('resign')}
                >
                  {tChess('resign')}
                </Button>
              </div>
            )}

            {promotionMoves.length > 0 && (
              <div role="group" aria-label={tChess('choosePromotionPiece')}>
                <p>{tChess('promoteYourPawn')}</p>

                {promotionMoves.map((move) => (
                  <Button
                    key={tChess(
                      promotionLabels[move.promotion ?? ''] ?? 'promotionQueen',
                    )}
                    onClick={() => playMove(move)}
                  >
                    {tChess(
                      promotionLabels[move.promotion ?? ''] ?? 'promotionQueen',
                    )}
                  </Button>
                ))}

                <Button
                  variant="secondary"
                  onClick={() => setPromotionMoves([])}
                >
                  {tCommon('cancel')}
                </Button>
              </div>
            )}

            {error && <p role="alert">{error}</p>}
          </GameInfo>

          {boardOrientation !== null && (
            <ChessBoard
              board={board}
              orientation={boardOrientation}
              selectedSquare={selectedSquare}
              onSquareClick={handleSquareClick}
              legalMoves={legalMoves}
              disabled={
                waitingForFriend ||
                game.isOver() ||
                remoteOutcome?.status === 'OVER' ||
                promotionMoves.length > 0 ||
                isRotating
              }
            />
          )}

          <GameChat aria-label={tChat('gameChat')}>
            <ChatBox
              title={tChat('gameChat')}
              chatId={isRemoteGame ? remoteChatId ?? undefined : undefined}
            />
          </GameChat>
        </GameArea>
      </PlayContent>

      <Footer />
    </Page>
  );
}

export default Play;
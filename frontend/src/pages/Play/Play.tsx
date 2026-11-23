import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChessGame from '../../../../chessgame/src/chessgame';
import type {
  Move,
  Square as SquareName,
} from '../../../../chessgame/src/chessgame.types';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import Avatar from '../../components/Avatar/Avatar';
import GameStatus from '../../components/GameStatus/GameStatus';
import ChatBox from '../../components/ChatBox/ChatBox';
import Button from '../../components/Button/Button';
import PlayGameActions from '../../components/Play/PlayGameActions';
import PlayLobby from '../../components/Play/PlayLobby';
import { useOnlineGame } from '../../hooks/useOnlineGame';
import { Page } from '../Home/Home.styles';
import { PlayContent, GameArea, GameInfo, GameChat } from './Play.styles';

const promotionLabels = {
  queen: 'promotionQueen',
  rook: 'promotionRook',
  bishop: 'promotionBishop',
  knight: 'promotionKnight',
} as const;

function PlayGame({ gameId }: { gameId: number }) {
  const { t: tChess } = useTranslation('chess');
  const { t: tCommon } = useTranslation('common');
  const { t: tChat } = useTranslation('chat');
  const [localGame, setLocalGame] = useState(() => new ChessGame());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isRotating, setIsRotating] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<SquareName | null>(null);
  const [promotionMoves, setPromotionMoves] = useState<Move[]>([]);
  const [localError, setLocalError] = useState('');

  const resetBoardInteraction = useCallback(() => {
    setSelectedSquare(null);
    setPromotionMoves([]);
    setIsRotating(false);
  }, []);

  const isRemoteGame = Number.isInteger(gameId) && gameId > 0;
  const online = useOnlineGame(
    isRemoteGame ? gameId : undefined,
    resetBoardInteraction,
  );
  const game = isRemoteGame ? online.game : localGame;
  const remoteStatus = isRemoteGame ? online.status : undefined;
  const boardOrientation = isRemoteGame
    ? online.side?.playerColor ?? null
    : orientation;
  const opponentName = online.side?.opponentName ?? tChess('opponent');
  const gameIsOver = game.isOver() || remoteStatus === 'OVER';
  const waitingForFriend =
    isRemoteGame && !online.bothPlayersPresent && !gameIsOver;
  const error = isRemoteGame ? online.error : localError;
  const board = game.getBoard();
  const legalMoves =
    selectedSquare && !isRotating && promotionMoves.length === 0
      ? game.getMoves(selectedSquare)
      : [];

  useEffect(() => {
    if (isRemoteGame || orientation === game.getTurn()) return;

    const timer = setTimeout(() => {
      setOrientation(game.getTurn());
      setIsRotating(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [game, orientation, isRemoteGame]);

  async function playMove(move: Move) {
    if (isRemoteGame) {
      await online.playMove(move);
      return;
    }

    try {
      setLocalGame(new ChessGame([...game.getHistory(), move]));
      setIsRotating(true);
      setSelectedSquare(null);
      setPromotionMoves([]);
      setLocalError('');
    } catch (error: unknown) {
      setLocalError(
        error instanceof Error ? error.message : tChess('unableToPlayThisMove'),
      );
    }
  }

  function handleSquareClick(square: SquareName) {
    if (gameIsOver || promotionMoves.length > 0 || isRotating) return;

    if (isRemoteGame) online.clearError();
    else setLocalError('');

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
        void playMove(move);
        return;
      }
    }

    const piece = board[square];
    setSelectedSquare(piece?.color === game.getTurn() ? square : null);
  }

  return (
    <Page>
      <Navbar />

      <PlayContent className="container">
        <GameArea aria-label={tChess('localChessGame')}>
          <GameInfo aria-label={tChess('gameInformation')}>
            <div className="opponent">
              <Avatar
                src={online.side?.opponentAvatar || '/avatars/default.svg'}
                username={opponentName}
                size={64}
                isOnline={!isRemoteGame || online.opponentIsOnline}
              />
              <span>{opponentName}</span>
            </div>

            {boardOrientation !== null && (
              <GameStatus
                game={game}
                message={waitingForFriend ? tChess('waitingForFriend') : undefined}
                remoteStatus={remoteStatus}
                remoteResult={isRemoteGame ? online.result : undefined}
              />
            )}

            {isRemoteGame && !gameIsOver && (
              <PlayGameActions
                drawRequestSent={online.drawRequestSent}
                onOfferDraw={() => void online.offerDraw()}
                onResign={() => void online.resign()}
              />
            )}

            {promotionMoves.length > 0 && (
              <div role="group" aria-label={tChess('choosePromotionPiece')}>
                <p>{tChess('promoteYourPawn')}</p>

                {promotionMoves.map((move) => (
                  <Button
                    key={move.promotion}
                    onClick={() => void playMove(move)}
                  >
                    {tChess(promotionLabels[move.promotion ?? 'queen'])}
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
                (waitingForFriend && game.getHistory().length === 0) ||
                gameIsOver ||
                promotionMoves.length > 0 ||
                isRotating
              }
            />
          )}

          <GameChat aria-label={tChat('gameChat')}>
            <ChatBox title={tChat('gameChat')} chatId={online.side?.chatId} />
          </GameChat>
        </GameArea>
      </PlayContent>

      <Footer />
    </Page>
  );
}

export default function Play() {
  const { gameId } = useParams();
  return gameId === undefined
    ? <PlayLobby />
    : <PlayGame key={gameId} gameId={Number(gameId)} />;
}
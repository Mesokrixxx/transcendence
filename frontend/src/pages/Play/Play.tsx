import { useEffect, useState } from 'react';
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
import { Page } from '../Home/Home.styles';
import { PlayContent, GameArea, GameInfo, GameChat } from './Play.styles';
import { useTranslation } from 'react-i18next';

type PromotionLabelKey =
  'promotionQueen' | 'promotionRook' | 'promotionBishop' | 'promotionKnight';

const promotionLabels: Record<string, PromotionLabelKey> = {
  queen: 'promotionQueen',
  rook: 'promotionRook',
  bishop: 'promotionBishop',
  knight: 'promotionKnight',
};

function Play() {
  const { t: tChess } = useTranslation('chess');
  const { t: tCommon } = useTranslation('common');
  const { t: tChat } = useTranslation('chat');
  const [game, setGame] = useState(() => new ChessGame());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [isRotating, setIsRotating] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<SquareName | null>(null);
  const [promotionMoves, setPromotionMoves] = useState<Move[]>([]);
  const [error, setError] = useState('');

  const board = game.getBoard();

  let legalMoves: DeepReadonly<Move[]> = [];
  if (selectedSquare && !isRotating && promotionMoves.length === 0) {
    legalMoves = game.getMoves(selectedSquare);
  }

  useEffect(() => {
    if (orientation === game.getTurn()) return;
    const timer = setTimeout(() => {
      setOrientation(game.getTurn());
      setIsRotating(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [game, orientation]);

  function playMove(move: Move) {
    try {
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

  function handleSquareClick(square: SquareName) {
    if (game.isOver() || promotionMoves.length > 0 || isRotating) return;

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

  return (
    <Page>
      <Navbar />

      <PlayContent className="container">
        <GameArea aria-label={tChess('localChessGame')}>
          <GameInfo aria-label={tChess('gameInformation')}>
            <div className="opponent">
              <Avatar username={tChess('opponent')} size={64} isOnline={true} />
              <span>{tChess('opponent')}</span>
            </div>

            <GameStatus game={game} />

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

          <ChessBoard
            board={board}
            orientation={orientation}
            // orientation={playerColor}
            selectedSquare={selectedSquare}
            onSquareClick={handleSquareClick}
            legalMoves={legalMoves}
            disabled={game.isOver() || promotionMoves.length > 0 || isRotating}
          />
          <GameChat aria-label={tChat('gameChat')}>
            <ChatBox title={tChat('gameChat')} />
          </GameChat>
        </GameArea>
      </PlayContent>

      <Footer />
    </Page>
  );
}

export default Play;

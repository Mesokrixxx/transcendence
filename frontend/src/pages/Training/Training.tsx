import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChessGame from '../../../../chessgame/src/chessgame';
import type {
  Move,
  DeepReadonly,
  Square as SquareName,
} from '../../../../chessgame/src/chessgame.types';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ChessBoard from '../../components/ChessBoard/ChessBoard';
import GameStatus from '../../components/GameStatus/GameStatus';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import {
  TrainingContent,
  GameArea,
  GameInfo,
} from './Training.styles';

function Training() {
  const { t } = useTranslation('chess');
  const [game, setGame] = useState(() => new ChessGame());
  const [orientation, setOrientation] =
    useState<'white' | 'black'>('white');
  const [isRotating, setIsRotating] = useState(false);
  const [selectedSquare, setSelectedSquare] =
    useState<SquareName | null>(null);
  const [promotionMoves, setPromotionMoves] = useState<Move[]>([]);
  const [hasError, setHasError] = useState(false);

  const board = game.getBoard();

  const promotionLabels: Record<string, string> = {
    queen: t('promotionQueen'),
    rook: t('promotionRook'),
    bishop: t('promotionBishop'),
    knight: t('promotionKnight'),
  };

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
      setHasError(false);
    } catch {
      setHasError(true);
    }
  }

  function handleSquareClick(square: SquareName) {
    if (game.isOver() || promotionMoves.length > 0 || isRotating) {
      return;
    }

    setHasError(false);

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

      <TrainingContent className="container">
        <GameArea aria-label={t('localChessGame')}>
          <GameInfo aria-label={t('gameInformation')}>
            <h1>{t('training', { ns: 'navigation' })}</h1>
            <p>{t('trainingDescription')}</p>

            <GameStatus game={game} />

            {promotionMoves.length > 0 && (
              <div
                role="group"
                aria-label={t('choosePromotionPiece')}
              >
                <p>{t('promoteYourPawn')}</p>

                {promotionMoves.map((move) => (
                  <Button
                    key={move.promotion}
                    onClick={() => playMove(move)}
                  >
                    {promotionLabels[move.promotion ?? '']}
                  </Button>
                ))}

                <Button
                  variant="secondary"
                  onClick={() => setPromotionMoves([])}
                >
                  {t('cancel', { ns: 'common' })}
                </Button>
              </div>
            )}

            {hasError && (
              <p role="alert">{t('unableToPlayThisMove')}</p>
            )}
          </GameInfo>

          <ChessBoard
            board={board}
            orientation={orientation}
            selectedSquare={selectedSquare}
            onSquareClick={handleSquareClick}
            legalMoves={legalMoves}
            disabled={
              game.isOver() ||
              promotionMoves.length > 0 ||
              isRotating
            }
          />
        </GameArea>
      </TrainingContent>

      <Footer />
    </Page>
  );
}

export default Training;
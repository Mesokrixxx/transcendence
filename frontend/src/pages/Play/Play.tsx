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

function Play() {
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
        error instanceof Error ? error.message : 'Unable to play this move.',
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
        <GameArea aria-label="Local chess game">
          <GameInfo aria-label="Game information">
            <div className="opponent">
              <Avatar username="Opponent" size={64} isOnline={true} />
              <span>Opponent</span>
            </div>

            <GameStatus game={game} />

            {promotionMoves.length > 0 && (
              <div role="group" aria-label="Choose a promotion piece">
                <p>Promote your pawn:</p>

                {promotionMoves.map((move) => (
                  <Button key={move.promotion} onClick={() => playMove(move)}>
                    {move.promotion}
                  </Button>
                ))}

                <Button
                  variant="secondary"
                  onClick={() => setPromotionMoves([])}
                >
                  Cancel
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
          <GameChat aria-label="Game chat">
            <ChatBox title="Game chat" />
          </GameChat>
        </GameArea>
      </PlayContent>

      <Footer />
    </Page>
  );
}

export default Play;

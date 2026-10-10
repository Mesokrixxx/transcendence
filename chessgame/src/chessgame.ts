import type { Board, Color, DeepReadonly, Move, Square } from './chessgame.types';
import { GameStatus } from './chessgame.types';
import InternalGame from './internal-game';

class ChessGame {
  // Starts a new ChessGame if no moves are provided or reconstructs game from given moves
  // Throws if a move isn't legal
  constructor(moves?: Move[]) {
    if (moves) {
      for (const move of moves) {
        try {
          this.move(move);
        } catch (e: unknown) {
          if (e instanceof Error)
            throw new Error(`Invalid game initialization move list: ${e.message}`);
          else
            throw new Error('Unexpected error during game initialization');
        }
      }
    }
  }

  private game: InternalGame = new InternalGame();

  getBoard(): DeepReadonly<Board> {
    return this.game.getBoard();
  }
  getTurn(): Color {
    return this.game.getTurn();
  }

  // List every legal move for the piece on the given square or for every piece on the board
  getMoves(square?: Square): DeepReadonly<Move[]> {
    const moves: Move[] = [];
    for (const move of this.game.getLegalMoves()) {
      if (!square || move.from === square)
        moves.push({ from: move.from, to: move.to, promotion: move.promotion });
    }
    return moves;
  }

  // Returns the game's move history
  getHistory(): DeepReadonly<Move[]> {
    const history: Move[] = [];
    for (const move of this.game.getMoveHistory()) {
      history.push({ from: move.from, to: move.to, promotion: move.promotion });
    }
    return history;
  }

  isLegalMove(move: Move): boolean {
    return this.getMoves(move.from).some((m) => {
      return m.from === move.from && m.to === move.to && m.promotion === move.promotion;
    });
  }
  // Throws if isLegalMove(move) is false
  move(move: Move): void {
    if (this.isOver())
      throw new Error('Trying to play move while game is over');
    if (!this.isLegalMove(move))
      throw new Error('Invalid move');
    this.game.makeMove(move);
  }


  getGameStatus(): GameStatus {
    return this.game.getGameStatus();
  }

  isCheckmate(): boolean {
    return this.game.getGameStatus() === GameStatus.CHECKMATE;
  }

  isCheck(): boolean {
    return this.game.getGameStatus() === GameStatus.CHECK || this.game.getGameStatus() === GameStatus.CHECKMATE;
  }

  isDraw(): boolean {
    return this.isStalemate() || this.isDrawByInsufficientMaterial() ||
      this.isDrawByRepetition() || this.isDrawByFiftyMoves();
  }

  isStalemate(): boolean {
    return this.game.getGameStatus() === GameStatus.STALEMATE;
  }

  isDrawByInsufficientMaterial(): boolean {
    return this.game.getGameStatus() === GameStatus.INSUFMATERIAL;
  }

  isDrawByRepetition(): boolean {
    return this.game.getGameStatus() === GameStatus.REPETITION;
  }

  isDrawByFiftyMoves(): boolean {
    return this.game.getGameStatus() === GameStatus.FIFTYMOVES;
  }

  isOver(): boolean {
    return this.isCheckmate() || this.isDraw();
  }
}

export default ChessGame;

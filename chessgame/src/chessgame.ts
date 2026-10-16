import type {
  Board,
  Color,
  DeepReadonly,
  Move,
  Square,
} from './chessgame.types.js';
import {
  GameStatus,
  type DrawReason,
  type DrawClaimReason,
} from './chessgame.types.js';
import InternalGame from './internal-game.js';

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
            throw new Error(
              `Invalid game initialization move list: ${e.message}`,
            );
          else throw new Error('Unexpected error during game initialization');
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
      if (!square || move.from === square) {
        if (move.promotion)
          moves.push({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
        else moves.push({ from: move.from, to: move.to });
      }
    }
    return moves;
  }

  // Returns the game's move history
  getHistory(): DeepReadonly<Move[]> {
    const history: Move[] = [];
    for (const move of this.game.getMoveHistory()) {
      if (move.promotion)
        history.push({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        });
      else history.push({ from: move.from, to: move.to });
    }
    return history;
  }

  isLegalMove(move: Move): boolean {
    return this.getMoves(move.from).some((m) => {
      return (
        m.from === move.from &&
        m.to === move.to &&
        m.promotion === move.promotion
      );
    });
  }
  // Throws if isLegalMove(move) is false
  move(move: Move): void {
    if (this.isOver())
      throw new Error('Trying to play move while game is over');
    this.game.move(move);
  }

  getGameStatus(): GameStatus {
    if (this.isCheckmate())
      return this.getTurn() === 'white'
        ? GameStatus.BLACKWON
        : GameStatus.WHITEWON;
    return this.isDraw() ? GameStatus.DRAW : GameStatus.ONGOING;
  }

  isCheck(): boolean {
    return this.game.isCheck();
  }

  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  isDraw(): boolean {
    return (
      this.game.isStalemate() ||
      this.game.isInsufficientMaterial() ||
      this.game.isDrawByFivefoldRepetition() ||
      this.game.isDrawBySeventyFiveMoves()
    );
  }

  getDrawReason(): DrawReason | null {
    if (this.game.isStalemate()) return 'stalemate';
    if (this.game.isInsufficientMaterial()) return 'insufficient material';
    if (this.game.isDrawByFivefoldRepetition()) return 'fivefold-repetition';
    if (this.game.isDrawBySeventyFiveMoves()) return 'seventy-five moves';
    return null;
  }

  canClaimDraw(): DrawClaimReason[] {
    const drawReasons: DrawClaimReason[] = [];
    if (this.game.canClaimDrawByThreefoldRepetition())
      drawReasons.push('threefold-repetition');
    if (this.game.canClaimDrawByFiftyMoves()) drawReasons.push('fifty moves');
    return drawReasons;
  }

  isOver(): boolean {
    return this.isCheckmate() || this.isDraw();
  }
}

export default ChessGame;

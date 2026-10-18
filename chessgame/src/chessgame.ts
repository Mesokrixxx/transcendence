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

/**
 * Represents a complete game of Chess.
 *
 * Handles move generation and validation, detects end-of-game and provides move history.
 */
class ChessGame {
  /**
   * Creates a new game.
   *
   * If no moves are provided, the game starts from the standard starting
   * position. Otherwise, the game will be constructed by playing the
   * provided moves.
   *
   * @param moves - Moves provided to reconstruct an existing game.
   * @throws {Error} If one of the provided moves is illegal.
   */
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

  /**
   * Returns a representation of the current board state.
   *
   * @returns An object containing an entry for every square of the board.
   * Each entry value is either a Piece representing the piece located
   * at that square, or null if no piece is on the square.
   */
  getBoard(): DeepReadonly<Board> {
    return this.game.getBoard();
  }

  /**
   * Returns the player whose turn it is to play.
   *
   * @returns The color of the player that has the move.
   */
  getTurn(): Color {
    return this.game.getTurn();
  }

  /**
   * Returns a list of all legal moves for the current position.
   *
   * If a square is provided, only moves from that square are returned.
   *
   * @param square - Optional square to filter the moves by.
   * @returns An array containing all legal moves, optionnaly filtered by square.
   */
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

  /**
   * Returns a list of all moves played since the beginning of the game.
   *
   * @returns An array containing all moves played since the beginning of the game, ordered from first to last.
   */
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

  /**
   * Checks if the given move is legal in the current position.
   *
   * @param move - The move that will be checked.
   * @returns `true` if the move is legal and `false` otherwise.
   */
  isLegalMove(move: Move): boolean {
    return this.getMoves(move.from).some((m) => {
      return (
        m.from === move.from &&
        m.to === move.to &&
        m.promotion === move.promotion
      );
    });
  }

  /**
   * Plays the given move.
   *
   * @param move - The move to be played.
   * @throws {Error} If the move is illegal.
   */
  move(move: Move): void {
    this.game.move(move);
  }

  /**
   * Returns the current game status.
   *
   * @returns The current game status
   */
  getGameStatus(): GameStatus {
    if (this.isCheckmate())
      return this.getTurn() === 'white'
        ? GameStatus.BLACKWON
        : GameStatus.WHITEWON;
    return this.isDraw() ? GameStatus.DRAW : GameStatus.ONGOING;
  }

  /**
   * Checks if the player whose turn it is is currentl in check.
   *
   * Checkmate is a special case of check, so this also returns `true`
   * when the player has been checkmated.
   *
   * @returns `true` if the player whose turn it is is in check and `false` otherwise.
   */
  isCheck(): boolean {
    return this.game.isCheck();
  }

  /**
   * Checks if the player that has the move has been checkmated.
   *
   * @returns `true` if the player that has the move has been checkmated and `false` otherwise.
   */
  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  /**
   * Checks if the game ended in a draw.
   *
   * @returns `true` if an automatic draw pattern ended the game and `false` otherwise.
   */
  isDraw(): boolean {
    return (
      this.game.isStalemate() ||
      this.game.isInsufficientMaterial() ||
      this.game.isDrawByFivefoldRepetition() ||
      this.game.isDrawBySeventyFiveMoves()
    );
  }

  /**
   * Returns the reason for the current draw.
   *
   * @returns A draw reason if the game ended in a draw, or null otherwise.
   */
  getDrawReason(): DrawReason | null {
    if (this.game.isStalemate()) return 'stalemate';
    if (this.game.isInsufficientMaterial()) return 'insufficient material';
    if (this.game.isDrawByFivefoldRepetition()) return 'fivefold-repetition';
    if (this.game.isDrawBySeventyFiveMoves()) return 'seventy-five moves';
    return null;
  }

  /**
   * Returns a list of all draws that can be claimed.
   *
   * @returns An array containing all claimable draws in the current position.
   * If no draw is claimable, the returned array will be empty.
   */
  canClaimDraw(): DrawClaimReason[] {
    const drawReasons: DrawClaimReason[] = [];
    if (this.game.canClaimDrawByThreefoldRepetition())
      drawReasons.push('threefold-repetition');
    if (this.game.canClaimDrawByFiftyMoves()) drawReasons.push('fifty moves');
    return drawReasons;
  }

  /**
   * Checks if the game is over.
   *
   * @returns `true` if the game is over (either by checkmate or by draw) and `false` otherwise.
   */
  isOver(): boolean {
    return this.game.isOver();
  }
}

export default ChessGame;

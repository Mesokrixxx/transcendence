// prettier-ignore
export type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T
  : T extends readonly (infer U)[] ? readonly DeepReadonly<U>[]
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

export type Color = 'white' | 'black';

export type PieceType =
  'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export type PiecePromotionType = 'queen' | 'rook' | 'bishop' | 'knight';

/**
 * Represents a chess piece.
 */
export interface Piece {
  color: Color;
  type: PieceType;
}

/**
 * The notation used for all board squares.
 *
 * `a1` is the bottom left square and `h8` is the top right square.
 */
// prettier-ignore
export type Square = 
  | "a1" | "b1" | "c1" | "d1" | "e1" | "f1" | "g1" | "h1"
  | "a2" | "b2" | "c2" | "d2" | "e2" | "f2" | "g2" | "h2"
  | "a3" | "b3" | "c3" | "d3" | "e3" | "f3" | "g3" | "h3"
  | "a4" | "b4" | "c4" | "d4" | "e4" | "f4" | "g4" | "h4"
  | "a5" | "b5" | "c5" | "d5" | "e5" | "f5" | "g5" | "h5"
  | "a6" | "b6" | "c6" | "d6" | "e6" | "f6" | "g6" | "h6"
  | "a7" | "b7" | "c7" | "d7" | "e7" | "f7" | "g7" | "h7"
  | "a8" | "b8" | "c8" | "d8" | "e8" | "f8" | "g8" | "h8";

/**
 * Represents a move in a game.
 */
export interface Move {
  /** The square occupied by the piece before the move */
  from: Square;
  /** The destination square */
  to: Square;
  /** The piece to promote a pawn to, if the move is a promotion */
  promotion?: PiecePromotionType;
}

/**
 * Represents the current state of the chess board.
 */
export type Board = Record<Square, Piece | null>;

export enum GameStatus {
  /** The game is in progress. */
  ONGOING,
  /** The game ended in a draw. */
  DRAW,
  /** White won by checkmate. */
  WHITEWON,
  /** Black won by checkmate. */
  BLACKWON,
}

export type DrawReason =
  | 'stalemate'
  | 'insufficient material'
  | 'threefold-repetition'
  | 'fivefold-repetition'
  | 'fifty moves'
  | 'seventy-five moves';

export type DrawClaimReason = 'threefold-repetition' | 'fifty moves';

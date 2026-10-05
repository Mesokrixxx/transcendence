// prettier-ignore
type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T
  : T extends readonly (infer U)[] ? readonly DeepReadonly<U>[]
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type Color = "white" | "black";

type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

type PiecePromotionType = "queen" | "rook" | "bishop" | "knight";

interface Piece {
  color: Color;
  type: PieceType;
}

// All squares of the board, listed from White's perspective
// prettier-ignore
type Square = 
  | "a8" | "b8" | "c8" | "d8" | "e8" | "f8" | "g8" | "h8"
  | "a7" | "b7" | "c7" | "d7" | "e7" | "f7" | "g7" | "h7"
  | "a6" | "b6" | "c6" | "d6" | "e6" | "f6" | "g6" | "h6"
  | "a5" | "b5" | "c5" | "d5" | "e5" | "f5" | "g5" | "h5"
  | "a4" | "b4" | "c4" | "d4" | "e4" | "f4" | "g4" | "h4"
  | "a3" | "b3" | "c3" | "d3" | "e3" | "f3" | "g3" | "h3"
  | "a2" | "b2" | "c2" | "d2" | "e2" | "f2" | "g2" | "h2"
  | "a1" | "b1" | "c1" | "d1" | "e1" | "f1" | "g1" | "h1";

interface Move {
  from: Square;
  to: Square;
  promotion?: PiecePromotionType;
}

type Board = Record<Square, Piece | null>;

enum GameStatus {
  ONGOING,
  CHECK,
  CHECKMATE,
  DRAW,
  STALEMATE,
  INSUFMATERIAL,
  REPETITION,
  FIFTYMOVES,
}

class ChessGame {
  // Starts a new ChessGame if no moves are provided or reconstructs game from given moves
  // Throws if a move isn't legal
  constructor(moves?: Move[]);

  getBoard(): DeepReadonly<Board>;
  getTurn(): Color;

  // List every legal move for every piece on the board
  getMoves(): DeepReadonly<Move[]>;
  // List every legal move for the piece on the given square
  getMoves(square: Square): DeepReadonly<Move[]>;

  // Returns the game's move history
  getHistory(): DeepReadonly<Move[]>;

  isLegalMove(move: Move): boolean;
  // Throws if isLegalMove(move) is false
  move(move: Move): void;


  getGameStatus(): GameStatus;
  isCheckmate(): boolean;
  isCheck(): boolean;
  isDraw(): boolean;
  isStalemate(): boolean;
  isDrawByInsufficientMaterial(): boolean;
  isDrawByRepetition(): boolean;
  isDrawByFiftyMoves(): boolean;


  isOver(): boolean;
}

import type { Board, Color, DeepReadonly, Move, Piece, Square } from './chessgame.types';
import { GameStatus } from './chessgame.types';

interface CastlingRights {
  queenside: boolean;
  kingside: boolean;
}

interface Position {
  board: string;
  turn: Color;
  castlingRights: Record<Color, CastlingRights>
  enPassant: Square | null;
  halfMoves: number;
}

type History = {
  // position is the situation before move
  position: Position,
  move: Move,
}[];

const boardSquares: Square[] = [
  "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
  "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
  "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
  "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
  "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
  "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
  "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
  "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
];

class InternalBoard {
  constructor(setup?: string);

  private board: Piece[];

  pieceAt(square: Square): Piece | null;
  // squareFrom("e4", 1, 1) // f5
  squareFrom(square: Square, fileOffset: number, rankOffset: number): Square | null;

  setPiece(square: Square, piece: Piece): void;
  removePiece(square: Square): void;
  movePiece(from: Square, to: Square): void;

  toString(): string;
}

class InternalGame {
  constructor();

  private board: InternalBoard;
  private turn: Color = 'white';
  private castlingRights: Record<Color, CastlingRights> = {
    white: { queenside: true, kingside: true },
    black: { queenside: true, kingside: true },
  };
  private enPassant: Square | null = null;
  // Draw by fifty moves when reaching 100 half moves
  private halfMoves = 0;
  private history: History = [];
  private gameStatus: GameStatus = GameStatus.ONGOING;

  // Store legalMoves once computed for the current state
  private legalMoves: Move[] | null;

  private getPseudoLegalMoves(): Move[];
  getLegalMoves(): Move[];

  makeMove(move: Move): void;
  undoMove(): void;

  getBoard(): Board;
  getTurn(): Color;
  getMoveHistory(): Move[];
  getGameStatus(): GameStatus;
}

class ChessGame {
  // Starts a new ChessGame if no moves are provided or reconstructs game from given moves
  // Throws if a move isn't legal
  constructor(moves?: Move[]);

  private game: InternalGame;

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

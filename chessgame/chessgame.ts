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

// prettier-ignore
const boardSquares: readonly Square[] = [
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
  private static readonly charToPiece: DeepReadonly<Record<string, Piece>> =  {
    'K': { color: 'white', type: 'king' },
    'k': { color: 'black', type: 'king' },
    'Q': { color: 'white', type: 'queen' },
    'q': { color: 'black', type: 'queen' },
    'R': { color: 'white', type: 'rook' },
    'r': { color: 'black', type: 'rook' },
    'B': { color: 'white', type: 'bishop' },
    'b': { color: 'black', type: 'bishop' },
    'N': { color: 'white', type: 'knight' },
    'n': { color: 'black', type: 'knight' },
    'P': { color: 'white', type: 'pawn' },
    'p': { color: 'black', type: 'pawn' },
  };

  private static readonly boardSize = 64;

  constructor(setup?: string) {
    const board: (Piece | null)[] = [];

    // Constructor assumes a valid setup, as it should only be called with
    // setups returned from InternalBoard.toString().
    if (!setup)
      setup = 'RNBQKBNRPPPPPPPP................................pppppppprnbqkbnr';

    for (let i = 0; i < InternalBoard.boardSize; i++) {
      board.push(setup[i] === '.'
        ? null
        : {
          color: InternalBoard.charToPiece[setup[i]].color,
          type: InternalBoard.charToPiece[setup[i]].type
        });
    }
    this.board = board;
  }

  private board: (Piece | null)[];

  private static squareToIndex(square: Square): number {
    return (square.charCodeAt(1) - '1'.charCodeAt(0)) * 8 + (square.charCodeAt(0) - 'a'.charCodeAt(0));
  }

  pieceAt(square: Square): Piece | null {
    return this.board[InternalBoard.squareToIndex(square)];
  }
  // squareFrom("e4", 1, 1) // f5
  squareFrom(square: Square, fileOffset: number, rankOffset: number): Square | null {
    const squareIndex = InternalBoard.squareToIndex(square);
    const rank = Math.floor(squareIndex / 8) + rankOffset, file = squareIndex % 8 + fileOffset;
    if (rank < 0 || rank >= 8 || file < 0 || file >= 8)
      return null;
    return boardSquares[rank * 8 + file];
  }

  setPiece(piece: Piece, square: Square): void {
    this.board[InternalBoard.squareToIndex(square)] = piece;
  }
  removePiece(square: Square): Piece | null {
    const piece = this.board[InternalBoard.squareToIndex(square)];
    this.board[InternalBoard.squareToIndex(square)] = null;
    return piece;
  }
  movePiece(from: Square, to: Square): void {
    const piece = this.removePiece(from);
    if (piece)
      this.setPiece(piece, to);
  }

  toString(): string {
    let boardString = '';
    this.board.forEach((p) => {
      if (p === null)
        boardString += '.';
      else {
        const pieceChar = p.type === 'knight' ? 'n' : p.type.charAt(0);
        boardString += p.color === 'white' ? pieceChar.toUpperCase() : pieceChar;
      }
    });
    return boardString;
  }
}

class InternalGame {
  private board: InternalBoard = new InternalBoard();
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
  private legalMoves: Move[] | null = null;

  private getPseudoLegalMoves(): Move[] {
    // For "ray" moves (Queen/Rook/Bishop), moves will be added until out-of-board or occupied square
    // If the piece occupying the square is an opponent piece, the move will be added as well

    // For knight and king moves (except (long-)castle),
    // every non-out-of-board move with square non-occupied by ally piece will be added
    // For (long-)castle, moves will be added if king and rook are well placed on the board,
    // castling rights are available for castling type and squares between the two pieces are empty.

    // For pawns, one-square move will be added if square is empty.
    // Promotion moves (one for every promotion piece) will replace it if on the color 7th rank.
    // two-squares moves will be added if on the color 2th rank, one-square move is available and square is empty.
    // Lateral moves will be added if non-out-of-board and an opponent piece is on the square.
    // En-Passant will be added if the pawn can laterally jump on the En-Passant square.

    // For each piece on the board (ignoring empty squares and opponent pieces)
    // // Queen/Rook: Add horizontal Moves
    // // Queen/Rook: Add vertical Moves
    // // Queen/Bishop: Add diagonal Moves
    // // Knight: Add Knight Jumps
    // // King: Add King "normal" moves
    // // King: Add (long-)castle
    // // Pawn: Add (non-promotion) one-square move
    // // Pawn: Add one-square promotion move (with every different piece)
    // // Pawn: Add two-squares move
    // // Pawn: Add lateral moves
    // // Pawn: Add En-Passant move
  }

  getLegalMoves(): Move[];

  makeMove(move: Move): void;
  undoMove(): void;

  getBoard(): Board {
    // Type unsafe but the for-loop will properly fill the object
    const board: Board = {} as Board;

    for (const key of boardSquares) {
      const piece = this.board.pieceAt(key);
      if (piece == null)
        board[key] = null;
      else {
        board[key] = {
          color: piece.color,
          type: piece.type,
        };
      }
    }
    return board;
  }
  getTurn(): Color {
    return this.turn;
  }
  getMoveHistory(): Move[] {
    return this.history.map((h) => h.move);
  }
  getGameStatus(): GameStatus {
    return this.gameStatus;
  }
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

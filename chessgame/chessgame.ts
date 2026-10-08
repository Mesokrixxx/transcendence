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
  gameStatus: GameStatus;
}

type History = {
  // position is the situation before move
  position: Position,
  move: Move,
}[];

type Direction = -1 | 0 | 1;

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

const knightMoves: number[][]= [[-2, -1], [-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2]];

const kingMoves: number[][] = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];

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

  private getRayPseudoLegalMoves(moves: Move[], square: Square, fileDirection: Direction, rankDirection: Direction): void {
    let tempSquare: Square | null = null;

    for (let i = 1; (tempSquare = this.board.squareFrom(square, i * fileDirection, i * rankDirection)) !== null; i++) {
      const tempPiece = this.board.pieceAt(tempSquare);
      if (tempPiece === null || tempPiece.color !== this.turn)
        moves.push({ from: square, to: tempSquare });
      if (tempPiece !== null) break;
    }
  }

  private getPseudoLegalMovesFromList(moves: Move[], square: Square, list: number[][]): void {
    for (const direction of list) {
      const tempSquare = this.board.squareFrom(square, direction[0], direction[1]);
      if (tempSquare === null) continue;
      const piece = this.board.pieceAt(tempSquare);
      if (piece === null || piece.color !== this.turn)
        moves.push({ from: square, to: tempSquare });
    }
  }

  private getPseudoLegalCastleMoves(moves: Move[], square: Square): void {
    if (this.turn === 'white' && square !== 'e1' ||
        this.turn === 'black' && square !== 'e8')
      return;
    const queensideRook = this.board.pieceAt(this.board.squareFrom(square, -4, 0)!);
    const kingsideRook = this.board.pieceAt(this.board.squareFrom(square, 3, 0)!);
    if (this.castlingRights[this.turn].queenside && queensideRook !== null &&
        queensideRook.color === this.turn && queensideRook.type === 'rook' &&
        this.board.pieceAt(this.board.squareFrom(square, -3, 0)!) === null &&
        this.board.pieceAt(this.board.squareFrom(square, -2, 0)!) === null &&
        this.board.pieceAt(this.board.squareFrom(square, -1, 0)!) === null)
      moves.push({ from: square, to: this.board.squareFrom(square, -2, 0)! });
    if (this.castlingRights[this.turn].kingside && kingsideRook !== null &&
        kingsideRook.color === this.turn && kingsideRook.type === 'rook' &&
        this.board.pieceAt(this.board.squareFrom(square, 1, 0)!) === null &&
        this.board.pieceAt(this.board.squareFrom(square, 2, 0)!) === null)
      moves.push({ from: square, to: this.board.squareFrom(square, 2, 0)! });
  }

  private getPseudoLegalPawnMoves(moves: Move[], square: Square, direction: -1 | 1) {
    const frontSquare = this.board.squareFrom(square, 0, direction)!;
    const twoStepsSquare = this.board.squareFrom(square, 0, direction * 2);
    const lateralSquares = [this.board.squareFrom(square, -1, direction), this.board.squareFrom(square, 1, direction)];
    const isTouchdown = twoStepsSquare === null;
    const onFirstPawnRank = (this.turn === 'white' && square.charAt(1) === '2') ||
      (this.turn === 'black' && square.charAt(1) === '7');

    // Pawn: Add (non-promotion) one-square move
    if (this.board.pieceAt(frontSquare) === null && !isTouchdown)
      moves.push({ from: square, to: frontSquare });

    // Pawn: Add one-square promotion move (with every different piece)
    if (this.board.pieceAt(frontSquare) === null && isTouchdown) {
      moves.push({ from: square, to: frontSquare, promotion: 'queen' })
      moves.push({ from: square, to: frontSquare, promotion: 'rook' })
      moves.push({ from: square, to: frontSquare, promotion: 'bishop' })
      moves.push({ from: square, to: frontSquare, promotion: 'knight' })
    }

    // Pawn: Add two-squares move
    if (onFirstPawnRank && this.board.pieceAt(frontSquare) === null &&
        this.board.pieceAt(twoStepsSquare!) === null)
      moves.push({ from: square, to: twoStepsSquare! });
    for (const lateralSquare of lateralSquares) {
      if (lateralSquare === null) continue;
      const piece = this.board.pieceAt(lateralSquare);
      // Pawn: Add lateral moves
      if (piece !== null && piece.color !== this.turn) {
        if (isTouchdown) {
          moves.push({ from: square, to: lateralSquare, promotion: 'queen' })
          moves.push({ from: square, to: lateralSquare, promotion: 'rook' })
          moves.push({ from: square, to: lateralSquare, promotion: 'bishop' })
          moves.push({ from: square, to: lateralSquare, promotion: 'knight' })
        } else
          moves.push({ from: square, to: lateralSquare });
      }
      // Pawn: Add En-Passant move
      else if (lateralSquare === this.enPassant)
        moves.push({ from: square, to: lateralSquare });
    }
  }

  private getPseudoLegalMoves(): Move[] {
    const moves: Move[] = [];

    for (const square of boardSquares) {
      const piece = this.board.pieceAt(square);
      if (piece === null || piece.color !== this.turn) continue;

      if (piece.type === 'queen' || piece.type === 'rook') {
        // Queen/Rook: Add horizontal Moves
        this.getRayPseudoLegalMoves(moves, square, -1, 0);
        this.getRayPseudoLegalMoves(moves, square, 1, 0);
        // Queen/Rook: Add vertical Moves
        this.getRayPseudoLegalMoves(moves, square, 0, -1);
        this.getRayPseudoLegalMoves(moves, square, 0, 1);
      }

      if (piece.type === 'queen' || piece.type === 'bishop') {
        // Queen/Bishop: Add diagonal Moves
        this.getRayPseudoLegalMoves(moves, square, -1, -1);
        this.getRayPseudoLegalMoves(moves, square, -1, 1);
        this.getRayPseudoLegalMoves(moves, square, 1, 1);
        this.getRayPseudoLegalMoves(moves, square, 1, -1);
      }

      // Knight: Add Knight Jumps
      if (piece.type === 'knight')
        this.getPseudoLegalMovesFromList(moves, square, knightMoves);

      if (piece.type === 'king') {
        // King: Add King "normal" moves
        this.getPseudoLegalMovesFromList(moves, square, kingMoves);
        // King: Add (long-)castle
        this.getPseudoLegalCastleMoves(moves, square);
      }

      // Pawn: Add Pawn moves
      if (piece.type === 'pawn')
        this.getPseudoLegalPawnMoves(moves, square, this.turn === 'white' ? 1 : -1);
    }

    return moves;
  }

  private isInCheck(): boolean {
    return this.gameStatus === GameStatus.CHECK || this.gameStatus === GameStatus.CHECKMATE;
  }

  private isLegalCastleMove(move: Move): boolean {
    const direction = move.from.charCodeAt(0) < move.to.charCodeAt(0) ? 1 : -1;
    const inBetweenSquare = this.board.squareFrom(move.from, direction, 0)!;
    if (this.isInCheck())
      return false;
    this.makeMove({ from: move.from, to: inBetweenSquare }, false);
    if (this.isInCheck()) {
      this.undoMove();
      return false;
    }
    this.undoMove();
    this.makeMove(move, false);
    if (this.isInCheck()) {
      this.undoMove();
      return false;
    }
    this.undoMove();
    return true;
  }

  getLegalMoves(): Move[] {
    if (this.legalMoves !== null)
      return this.legalMoves;

    const pseudoLegalMoves = this.getPseudoLegalMoves();
    const legalMoves: Move[] = [];

    for (const move of pseudoLegalMoves) {
      if (this.board.pieceAt(move.from)!.type === 'king' &&
          Math.abs(move.from.charCodeAt(0) - move.to.charCodeAt(0)) === 2) {
        if (this.isLegalCastleMove(move))
          legalMoves.push(move);
      } else {
        this.makeMove(move, false);
        if (this.getGameStatus() !== GameStatus.CHECK && this.getGameStatus() !== GameStatus.CHECKMATE)
          legalMoves.push(move);
        this.undoMove();
      }
    }

    this.legalMoves = legalMoves;
    return legalMoves;
  }


  private getFirstPieceInRay(square: Square, fileDirection: -1 | 0 | 1, rankDirection: -1 | 0 | 1): Piece | null {
    let tempSquare: Square | null;

    for (let i = 1; (tempSquare = this.board.squareFrom(square, i * fileDirection, i * rankDirection)) !== null; i++) {
      const piece = this.board.pieceAt(tempSquare);
      if (piece !== null)
        return piece;
    }
    return null;
  }

  private kingIsAttacked(): boolean {
    let kingSquare: Square | null = null;
    for (const square of boardSquares) {
      const king = this.board.pieceAt(square);
      if (king && king.type === 'king' && king.color === this.turn) {
        kingSquare = square;
        break;
      }
    }
    if (!kingSquare) // never
      return false;

    // Horizontal checks
    for (const ray of [[-1, 0], [1, 0]]) {
      const piece = this.getFirstPieceInRay(kingSquare, ray[0] as Direction, ray[1] as Direction);
      if (piece && piece.color !== this.turn && (piece.type === 'queen' || piece.type === 'rook'))
        return true;
    }

    // Vertical checks
    for (const ray of [[0, 1], [0, -1]]) {
      const piece = this.getFirstPieceInRay(kingSquare, ray[0] as Direction, ray[1] as Direction);
      if (piece && piece.color !== this.turn && (piece.type === 'queen' || piece.type === 'rook'))
        return true;
    }

    // Diagonal checks
    for (const ray of [[-1, -1], [-1, 1], [1, 1], [1, -1]]) {
      const piece = this.getFirstPieceInRay(kingSquare, ray[0] as Direction, ray[1] as Direction);
      if (piece && piece.color !== this.turn && (piece.type === 'queen' || piece.type === 'bishop'))
        return true;
    }

    // Knight checks
    for (const jump of knightMoves) {
      const square = this.board.squareFrom(kingSquare, jump[0], jump[1]);
      if (square === null) continue;
      const piece = this.board.pieceAt(square);
      if (piece && piece.color !== this.turn && piece.type === 'knight')
        return true;
    }

    // Kings Duel Situation
    for (const move of kingMoves) {
      const square = this.board.squareFrom(kingSquare, move[0], move[1]);
      if (square === null) continue;
      const piece = this.board.pieceAt(square);
      if (piece && piece.color !== this.turn && piece.type === 'king')
        return true;
    }

    // Pawn checks
    const pawnSquares = [this.board.squareFrom(kingSquare, -1, this.turn === 'white' ? 1 : -1),
      this.board.squareFrom(kingSquare, 1, this.turn === 'white' ? 1 : -1)];
    for (const square of pawnSquares) {
      if (!square) continue;
      const piece = this.board.pieceAt(square);
      if (piece && piece.color !== this.turn && piece.type === 'pawn')
        return true;
    }
    return false;
  }

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

import type { DeepReadonly, Piece, Square } from './chessgame.types';

// prettier-ignore
export const boardSquares: readonly Square[] = [
  "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
  "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
  "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
  "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
  "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
  "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
  "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
  "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
];

export class InternalBoard {
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

import type { Board, Color, Move, Piece, Square } from './chessgame.types.js';
import { boardSquares, InternalBoard } from './internal-board.js';
import { GameStatus } from './chessgame.types.js';

type CastleSide = 'queenside' | 'kingside';

type CastlingRights = Record<CastleSide, boolean>;

interface Position {
  board: string;
  turn: Color;
  castlingRights: Record<Color, CastlingRights>;
  enPassant: Square | null;
  halfMoves: number;
  gameStatus: GameStatus;
}

interface InternalMove extends Move {
  piece: Piece;
  capturedPiece?: Piece;
  castleSide?: CastleSide;
  isEnPassant: boolean;
  isDoublePawnPush: boolean;
}

type History = {
  // position is the situation before move
  position: Position;
  move: Move;
}[];

type Direction = -1 | 0 | 1;

const knightMoves: [number, number][] = [
  [-2, -1],
  [-2, 1],
  [-1, 2],
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
];

const kingMoves: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
];

class InternalGame {
  constructor(position?: Partial<Omit<Position, 'gameStatus'>>) {
    // Starts the game from unique position
    // Unsafe for invalid fields, should only be called with valid data
    if (position) {
      if (position.board) this.board = new InternalBoard(position.board);
      if (position.turn) this.turn = position.turn;
      if (position.castlingRights) {
        this.castlingRights.white = {
          queenside: position.castlingRights.white.queenside,
          kingside: position.castlingRights.white.kingside,
        };
        this.castlingRights.black = {
          queenside: position.castlingRights.black.queenside,
          kingside: position.castlingRights.black.kingside,
        };
      }
      if (position.enPassant !== undefined) this.enPassant = position.enPassant;
      if (position.halfMoves !== undefined) this.halfMoves = position.halfMoves;
      this.getLegalMoves();
      this.setGameStatus();
    }
  }

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
  private legalMoves: InternalMove[] | null = null;

  private fileDiff(from: Square, to: Square): number {
    return to.charCodeAt(0) - from.charCodeAt(0);
  }

  private rankDiff(from: Square, to: Square): number {
    return to.charCodeAt(1) - from.charCodeAt(1);
  }

  private getInternalMove(move: Move): InternalMove {
    const piece: Piece = this.board.pieceAt(move.from)!;
    const isCastle =
      piece.type === 'king' &&
      Math.abs(this.fileDiff(move.to, move.from)) === 2;
    const internalMove: InternalMove = {
      from: move.from,
      to: move.to,
      piece: piece,
      isEnPassant:
        piece.type === 'pawn' &&
        this.enPassant !== null &&
        move.to === this.enPassant,
      isDoublePawnPush:
        piece.type === 'pawn' &&
        Math.abs(this.rankDiff(move.to, move.from)) === 2,
    };
    if (move.promotion) internalMove.promotion = move.promotion;
    const capturedPieceSquare = internalMove.isEnPassant
      ? this.board.squareFrom(move.from, this.fileDiff(move.from, move.to), 0)!
      : move.to;
    const capturedPiece = this.board.pieceAt(capturedPieceSquare);
    if (capturedPiece) internalMove.capturedPiece = capturedPiece;
    if (isCastle)
      internalMove.castleSide =
        this.fileDiff(move.from, move.to) < 0 ? 'queenside' : 'kingside';
    return internalMove;
  }

  private getRayPseudoLegalMoves(
    moves: Move[],
    square: Square,
    fileDirection: Direction,
    rankDirection: Direction,
  ): void {
    let tempSquare: Square | null = null;

    for (
      let i = 1;
      (tempSquare = this.board.squareFrom(
        square,
        i * fileDirection,
        i * rankDirection,
      )) !== null;
      i++
    ) {
      const tempPiece = this.board.pieceAt(tempSquare);
      if (tempPiece === null || tempPiece.color !== this.turn)
        moves.push({ from: square, to: tempSquare });
      if (tempPiece !== null) break;
    }
  }

  private getPseudoLegalMovesFromList(
    moves: Move[],
    square: Square,
    list: [number, number][],
  ): void {
    for (const direction of list) {
      const tempSquare = this.board.squareFrom(
        square,
        direction[0],
        direction[1],
      );
      if (tempSquare === null) continue;
      const piece = this.board.pieceAt(tempSquare);
      if (piece === null || piece.color !== this.turn)
        moves.push({ from: square, to: tempSquare });
    }
  }

  private getPseudoLegalCastleMoves(moves: Move[], square: Square): void {
    if (
      (this.turn === 'white' && square !== 'e1') ||
      (this.turn === 'black' && square !== 'e8')
    )
      return;
    const queensideRook = this.board.pieceAt(
      this.board.squareFrom(square, -4, 0)!,
    );
    const kingsideRook = this.board.pieceAt(
      this.board.squareFrom(square, 3, 0)!,
    );
    if (
      this.castlingRights[this.turn].queenside &&
      queensideRook !== null &&
      queensideRook.color === this.turn &&
      queensideRook.type === 'rook' &&
      this.board.pieceAt(this.board.squareFrom(square, -3, 0)!) === null &&
      this.board.pieceAt(this.board.squareFrom(square, -2, 0)!) === null &&
      this.board.pieceAt(this.board.squareFrom(square, -1, 0)!) === null
    )
      moves.push({ from: square, to: this.board.squareFrom(square, -2, 0)! });
    if (
      this.castlingRights[this.turn].kingside &&
      kingsideRook !== null &&
      kingsideRook.color === this.turn &&
      kingsideRook.type === 'rook' &&
      this.board.pieceAt(this.board.squareFrom(square, 1, 0)!) === null &&
      this.board.pieceAt(this.board.squareFrom(square, 2, 0)!) === null
    )
      moves.push({ from: square, to: this.board.squareFrom(square, 2, 0)! });
  }

  private getPseudoLegalPawnMoves(
    moves: Move[],
    square: Square,
    direction: -1 | 1,
  ) {
    const frontSquare = this.board.squareFrom(square, 0, direction)!;
    const twoStepsSquare = this.board.squareFrom(square, 0, direction * 2);
    const lateralSquares = [
      this.board.squareFrom(square, -1, direction),
      this.board.squareFrom(square, 1, direction),
    ];
    const isTouchdown = twoStepsSquare === null;
    const onFirstPawnRank =
      (this.turn === 'white' && square.charAt(1) === '2') ||
      (this.turn === 'black' && square.charAt(1) === '7');

    // Pawn: Add (non-promotion) one-square move
    if (this.board.pieceAt(frontSquare) === null && !isTouchdown)
      moves.push({ from: square, to: frontSquare });

    // Pawn: Add one-square promotion move (with every different piece)
    if (this.board.pieceAt(frontSquare) === null && isTouchdown) {
      moves.push({ from: square, to: frontSquare, promotion: 'queen' });
      moves.push({ from: square, to: frontSquare, promotion: 'rook' });
      moves.push({ from: square, to: frontSquare, promotion: 'bishop' });
      moves.push({ from: square, to: frontSquare, promotion: 'knight' });
    }

    // Pawn: Add two-squares move
    if (
      onFirstPawnRank &&
      this.board.pieceAt(frontSquare) === null &&
      this.board.pieceAt(twoStepsSquare!) === null
    )
      moves.push({ from: square, to: twoStepsSquare! });
    for (const lateralSquare of lateralSquares) {
      if (lateralSquare === null) continue;
      const piece = this.board.pieceAt(lateralSquare);
      // Pawn: Add lateral moves
      if (piece !== null && piece.color !== this.turn) {
        if (isTouchdown) {
          moves.push({ from: square, to: lateralSquare, promotion: 'queen' });
          moves.push({ from: square, to: lateralSquare, promotion: 'rook' });
          moves.push({ from: square, to: lateralSquare, promotion: 'bishop' });
          moves.push({ from: square, to: lateralSquare, promotion: 'knight' });
        } else moves.push({ from: square, to: lateralSquare });
      }
      // Pawn: Add En-Passant move
      else if (lateralSquare === this.enPassant)
        moves.push({ from: square, to: lateralSquare });
    }
  }

  private getPseudoLegalMoves(): InternalMove[] {
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
        this.getPseudoLegalPawnMoves(
          moves,
          square,
          this.turn === 'white' ? 1 : -1,
        );
    }

    // Will become return value after return type change
    const internalMoves: InternalMove[] = [];
    for (const move of moves) internalMoves.push(this.getInternalMove(move));

    return internalMoves;
  }

  private isLegalCastleMove(move: InternalMove): boolean {
    const direction: Direction = move.castleSide === 'kingside' ? 1 : -1;
    const inBetweenSquare = this.board.squareFrom(move.from, direction, 0)!;
    const color = this.turn;
    if (this.kingIsAttacked(color)) return false;
    this.makeMove(
      this.getInternalMove({ from: move.from, to: inBetweenSquare }),
    );
    if (this.kingIsAttacked(color)) {
      this.undoMove();
      return false;
    }
    this.undoMove();
    this.makeMove(move);
    if (this.kingIsAttacked(color)) {
      this.undoMove();
      return false;
    }
    this.undoMove();
    return true;
  }

  getLegalMoves(): Move[] {
    if (this.legalMoves === null) {
      const pseudoLegalMoves = this.getPseudoLegalMoves();
      const legalMoves: InternalMove[] = [];

      for (const move of pseudoLegalMoves) {
        if (move.castleSide) {
          if (this.isLegalCastleMove(move)) legalMoves.push(move);
        } else {
          const color = this.turn;
          this.makeMove(move);
          const isAttacked = this.kingIsAttacked(color);
          if (!isAttacked) legalMoves.push(move);
          this.undoMove();
        }
      }

      this.legalMoves = legalMoves;
    }

    return this.legalMoves.map((m) => {
      const move: Move = {
        from: m.from,
        to: m.to,
      };
      if (m.promotion)
        move.promotion = m.promotion;
      return move;
    });
  }

  private castle(move: InternalMove): void {
    const rookFrom =
      move.castleSide === 'queenside'
        ? this.board.squareFrom(move.from, -4, 0)!
        : this.board.squareFrom(move.from, 3, 0)!;
    const rookTo =
      move.castleSide === 'queenside'
        ? this.board.squareFrom(rookFrom, 3, 0)!
        : this.board.squareFrom(rookFrom, -2, 0)!;

    this.board.movePiece(move.from, move.to);
    this.board.movePiece(rookFrom, rookTo);

    // Remove castling rights
    this.castlingRights[this.turn].queenside = false;
    this.castlingRights[this.turn].kingside = false;
  }

  private getFirstPieceInRay(
    square: Square,
    fileDirection: Direction,
    rankDirection: Direction,
  ): Piece | null {
    let tempSquare: Square | null;

    for (
      let i = 1;
      (tempSquare = this.board.squareFrom(
        square,
        i * fileDirection,
        i * rankDirection,
      )) !== null;
      i++
    ) {
      const piece = this.board.pieceAt(tempSquare);
      if (piece !== null) return piece;
    }
    return null;
  }

  private kingIsAttacked(color: Color = this.turn): boolean {
    let kingSquare: Square | null = null;
    for (const square of boardSquares) {
      const king = this.board.pieceAt(square);
      if (king && king.type === 'king' && king.color === color) {
        kingSquare = square;
        break;
      }
    }
    if (!kingSquare)
      // never
      return false;

    // Horizontal checks
    for (const ray of [
      [-1, 0],
      [1, 0],
    ] as const) {
      const piece = this.getFirstPieceInRay(kingSquare, ray[0], ray[1]);
      if (
        piece &&
        piece.color !== color &&
        (piece.type === 'queen' || piece.type === 'rook')
      )
        return true;
    }

    // Vertical checks
    for (const ray of [
      [0, 1],
      [0, -1],
    ] as const) {
      const piece = this.getFirstPieceInRay(kingSquare, ray[0], ray[1]);
      if (
        piece &&
        piece.color !== color &&
        (piece.type === 'queen' || piece.type === 'rook')
      )
        return true;
    }

    // Diagonal checks
    for (const ray of [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1],
    ] as const) {
      const piece = this.getFirstPieceInRay(kingSquare, ray[0], ray[1]);
      if (
        piece &&
        piece.color !== color &&
        (piece.type === 'queen' || piece.type === 'bishop')
      )
        return true;
    }

    // Knight checks
    for (const jump of knightMoves) {
      const square = this.board.squareFrom(kingSquare, jump[0], jump[1]);
      if (square === null) continue;
      const piece = this.board.pieceAt(square);
      if (piece && piece.color !== color && piece.type === 'knight')
        return true;
    }

    // Kings Duel Situation
    for (const move of kingMoves) {
      const square = this.board.squareFrom(kingSquare, move[0], move[1]);
      if (square === null) continue;
      const piece = this.board.pieceAt(square);
      if (piece && piece.color !== color && piece.type === 'king') return true;
    }

    // Pawn checks
    const pawnSquares = [
      this.board.squareFrom(kingSquare, -1, color === 'white' ? 1 : -1),
      this.board.squareFrom(kingSquare, 1, color === 'white' ? 1 : -1),
    ];
    for (const square of pawnSquares) {
      if (!square) continue;
      const piece = this.board.pieceAt(square);
      if (piece && piece.color !== color && piece.type === 'pawn') return true;
    }
    return false;
  }

  private isInsufficientMaterial(): boolean {
    const pieces = {
      bishop: 0,
      knight: 0,
    };
    let pieceCount = 0;
    let lsb = 0;
    let squareColor: Color = 'black';

    for (const square of boardSquares) {
      const piece = this.board.pieceAt(square);
      if (piece !== null) {
        if (piece.type === 'bishop') {
          pieces.bishop++;
          if (squareColor === 'white') lsb++;
        } else if (piece.type === 'knight') pieces.knight++;
        pieceCount++;
      }
      if (square.charAt(0) !== 'h')
        squareColor = squareColor === 'white' ? 'black' : 'white';
    }

    if (pieceCount === 2) return true;
    if (pieceCount === 3 && (pieces.bishop === 1 || pieces.knight === 1))
      return true;
    if (
      pieceCount === 2 + pieces.bishop &&
      (lsb === 0 || lsb === pieces.bishop)
    )
      return true;
    return false;
  }

  private hashPosition(position: Position): string {
    let positionStr = position.board;
    positionStr += position.turn === 'white' ? 'w' : 'b';
    positionStr += position.castlingRights.white.queenside === true ? 'Q' : 'x';
    positionStr += position.castlingRights.white.kingside === true ? 'K' : 'x';
    positionStr += position.castlingRights.black.queenside === true ? 'q' : 'x';
    positionStr += position.castlingRights.black.kingside === true ? 'k' : 'x';
    positionStr += position.enPassant ?? 'xx';
    return positionStr;
  }

  private isThreefoldRepetition(): boolean {
    const uniquePositions: Record<string, number> = {};

    for (let i = this.history.length - 1; i >= 0; i--) {
      const h = this.history[i]!;
      const positionStr = this.hashPosition(h.position);
      if (uniquePositions[positionStr]) uniquePositions[positionStr]++;
      else uniquePositions[positionStr] = 1;
      if (h.position.halfMoves === 0) break;
    }
    const currentPositionStr = this.hashPosition({
      board: this.board.toString(),
      turn: this.turn,
      castlingRights: this.castlingRights,
      enPassant: this.enPassant,
      halfMoves: this.halfMoves,
      gameStatus: this.gameStatus,
    });
    const count = uniquePositions[currentPositionStr];
    return count !== undefined && count >= 2;
  }

  private setGameStatus(): void {
    const isAttacked = this.kingIsAttacked();
    if (this.legalMoves === null) {
      this.gameStatus = isAttacked ? GameStatus.CHECK : GameStatus.ONGOING;
      return;
    }
    if (isAttacked && this.legalMoves.length === 0)
      this.gameStatus = GameStatus.CHECKMATE;
    else if (this.legalMoves.length === 0)
      this.gameStatus = GameStatus.STALEMATE;
    else if (this.isInsufficientMaterial())
      this.gameStatus = GameStatus.INSUFMATERIAL;
    else if (this.isThreefoldRepetition())
      this.gameStatus = GameStatus.REPETITION;
    else if (isAttacked) this.gameStatus = GameStatus.CHECK;
    else if (this.halfMoves >= 100) this.gameStatus = GameStatus.FIFTYMOVES;
    else this.gameStatus = GameStatus.ONGOING;
  }

  private makeMove(move: InternalMove): void {
    const publicMove: Move = {
      from: move.from,
      to: move.to,
    }
    if (move.promotion) publicMove.promotion = move.promotion;
    this.history.push({
      position: {
        board: this.board.toString(),
        turn: this.turn,
        castlingRights: {
          white: {
            queenside: this.castlingRights.white.queenside,
            kingside: this.castlingRights.white.kingside,
          },
          black: {
            queenside: this.castlingRights.black.queenside,
            kingside: this.castlingRights.black.kingside,
          },
        },
        enPassant: this.enPassant,
        halfMoves: this.halfMoves,
        gameStatus: this.gameStatus,
      },
      move: publicMove,
    });

    const piece = move.piece;
    let isHalfMove = true;
    if (move.castleSide) this.castle(move);
    else if (piece.type === 'pawn' && move.promotion) {
      this.board.removePiece(move.from);
      this.board.setPiece({ color: this.turn, type: move.promotion }, move.to);
      isHalfMove = false;
    } else if (move.isEnPassant && this.enPassant) {
      this.board.removePiece(
        this.board.squareFrom(
          this.enPassant,
          0,
          this.turn === 'white' ? -1 : 1,
        )!,
      );
      this.board.movePiece(move.from, move.to);
      isHalfMove = false;
    } else {
      if (move.capturedPiece || piece.type === 'pawn') isHalfMove = false;
      this.board.movePiece(move.from, move.to);
    }

    // Update castling rights
    if (piece.type === 'king') {
      this.castlingRights[this.turn].queenside = false;
      this.castlingRights[this.turn].kingside = false;
    }
    if (move.from === 'a1' || move.to === 'a1')
      this.castlingRights['white'].queenside = false;
    else if (move.from === 'h1' || move.to === 'h1')
      this.castlingRights['white'].kingside = false;
    if (move.from === 'a8' || move.to === 'a8')
      this.castlingRights['black'].queenside = false;
    else if (move.from === 'h8' || move.to === 'h8')
      this.castlingRights['black'].kingside = false;

    // Update position
    if (move.isDoublePawnPush)
      this.enPassant = this.board.squareFrom(
        move.from,
        0,
        this.turn === 'white' ? 1 : -1,
      );
    else this.enPassant = null;
    this.turn = this.turn === 'white' ? 'black' : 'white';
    this.halfMoves = isHalfMove ? this.halfMoves + 1 : 0;
    this.legalMoves = null;
  }

  move(move: Move): void {
    if (!this.legalMoves) this.getLegalMoves();
    const internalMove = this.legalMoves!.find((m) => {
      return (move.from === m.from &&
              move.to === m.to &&
              move.promotion === m.promotion);
    });
    if (!internalMove) throw new Error('Invalid move');
    this.makeMove(internalMove);
    this.getLegalMoves();
    this.setGameStatus();
  }

  undoMove(): void {
    if (this.history.length === 0) return;

    const position = this.history.pop()!.position;
    this.board = new InternalBoard(position.board);
    this.turn = position.turn;
    this.castlingRights = {
      white: {
        queenside: position.castlingRights.white.queenside,
        kingside: position.castlingRights.white.kingside,
      },
      black: {
        queenside: position.castlingRights.black.queenside,
        kingside: position.castlingRights.black.kingside,
      },
    };
    this.enPassant = position.enPassant;
    this.halfMoves = position.halfMoves;
    this.gameStatus = position.gameStatus;
    this.legalMoves = null;
  }

  getBoard(): Board {
    // Type unsafe but the for-loop will properly fill the object
    const board: Board = {} as Board;

    for (const key of boardSquares) {
      const piece = this.board.pieceAt(key);
      if (piece == null) board[key] = null;
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

export default InternalGame;

import { describe, expect, it } from 'vitest';
import InternalGame from '../src/internal-game';
import { type Move } from '../src/chessgame.types';

// This test suite is designed to test cases from specific positions
// The InternalGame class will be instantiated with a custom board setup
// To play a game in a safe way, the ChessGame class should be used

/*
Default Board Visual from White's perspective
      board: boardFromVisual([
        'rnbqkbnr',
        'pppppppp',
        '........',
        '........',
        '........',
        '........',
        'PPPPPPPP',
        'RNBQKBNR',
      ]),
*/

function boardFromVisual(visual: string[]): string {
  if (visual.length !== 8) throw new Error('Invalid board visual');
  let board = '';
  for (let i = visual.length - 1; i >= 0; i--) board += visual[i];
  return board;
}

function playLegalMove(game: InternalGame, move: Move) {
  expect(game.getLegalMoves()).toContainEqual(move);
  game.move(move);
}

describe('InternalGame', () => {
  // Checks that custom position is read properly
  it('works on basic position', () => {
    const game = new InternalGame({
      // King and Queen are inverted
      board: boardFromVisual([
        'rnbkqbnr',
        'pppppppp',
        '........',
        '........',
        '........',
        '........',
        'PPPPPPPP',
        'RNBKQBNR',
      ]),
    });

    expect(Object.values(game.getBoard())).toHaveLength(64);
    expect(game.getTurn()).toBe('white');
    expect(game.getLegalMoves()).toHaveLength(20);
    expect(game.getMoveHistory()).toHaveLength(0);
    expect(game.isOver()).toBeFalsy();
    expect(game.getBoard().d1).toEqual({
      color: 'white',
      type: 'king',
    });
    expect(game.getBoard().e1).toEqual({
      color: 'white',
      type: 'queen',
    });
    expect(game.getBoard().d8).toEqual({
      color: 'black',
      type: 'king',
    });
    expect(game.getBoard().e8).toEqual({
      color: 'black',
      type: 'queen',
    });
  });

  it('promotes to expected piece', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '........',
        'P.......',
        '.K....k.',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]),
    });

    const move: Move = { from: 'a7', to: 'a8', promotion: 'queen' };
    playLegalMove(game, move);
    expect(game.getTurn()).toBe('black');
    expect(game.isOver()).toBeFalsy();
    expect(game.getBoard().a7).toBeNull();
    expect(game.getBoard().a8).toEqual({
      color: 'white',
      type: 'queen',
    });
  });

  it('promotes to any piece', () => {
    const game = new InternalGame({
      // Add a second pawn to avoid draw by insufficient material
      board: boardFromVisual([
        '........',
        'P.......',
        '.K....kp',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]),
    });

    const moves: Move[] = [
      { from: 'a7', to: 'a8', promotion: 'queen' },
      { from: 'a7', to: 'a8', promotion: 'rook' },
      { from: 'a7', to: 'a8', promotion: 'bishop' },
      { from: 'a7', to: 'a8', promotion: 'knight' },
    ];
    for (const move of moves) {
      playLegalMove(game, move);
      expect(game.isOver()).toBeFalsy();
      expect(game.getBoard().a7).toBeNull();
      expect(game.getBoard().a8).toEqual({
        color: 'white',
        type: move.promotion,
      });
      game.undoMove();
    }
    expect(game.getBoard().a7).toEqual({
      color: 'white',
      type: 'pawn',
    });
    expect(game.getBoard().a8).toBeNull();
  });

  it('disables castling after king/rook move', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        'r...k..r',
        'pppppppp',
        '........',
        '........',
        '........',
        '........',
        'PPPPPPPP',
        'R...K..R',
      ]),
    });

    expect(game.getLegalMoves()).toContainEqual({ from: 'e1', to: 'g1' });
    expect(game.getLegalMoves()).toContainEqual({ from: 'e1', to: 'c1' });
    // Move White's queenside rook
    playLegalMove(game, { from: 'a1', to: 'b1' });

    expect(game.getLegalMoves()).toContainEqual({ from: 'e8', to: 'g8' });
    expect(game.getLegalMoves()).toContainEqual({ from: 'e8', to: 'c8' });
    // Move Black's king
    playLegalMove(game, { from: 'e8', to: 'd8' });

    expect(game.getLegalMoves()).toContainEqual({ from: 'e1', to: 'g1' });
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e1', to: 'c1' });
    // Put White's rook back to its original place
    playLegalMove(game, { from: 'b1', to: 'a1' });

    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e8', to: 'g8' });
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e8', to: 'c8' });
    // Put Black's king back to its original place
    playLegalMove(game, { from: 'd8', to: 'e8' });

    // Still can't castle on the queenside
    expect(game.getLegalMoves()).toContainEqual({ from: 'e1', to: 'g1' });
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e1', to: 'c1' });
    // Castling isn't affected on the kingside
    playLegalMove(game, { from: 'e1', to: 'g1' });
    expect(game.getBoard().e1).toBeNull();
    expect(game.getBoard().g1).toEqual({
      color: 'white',
      type: 'king',
    });
    expect(game.getBoard().f1).toEqual({
      color: 'white',
      type: 'rook',
    });

    // Still can't castle after putting King back
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e8', to: 'g8' });
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e8', to: 'c8' });
  });

  it('detects and handles EnPassant', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '....k...',
        '....p...',
        '........',
        '...P.P..',
        '........',
        '........',
        '........',
        '....K...',
      ]),
      turn: 'black',
    });

    playLegalMove(game, { from: 'e7', to: 'e5' });
    expect(game.getBoard().e7).toBeNull();
    expect(game.getBoard().e5).toEqual({
      color: 'black',
      type: 'pawn',
    });

    const enPassantMoves: Move[] = [
      { from: 'd5', to: 'e6' },
      { from: 'f5', to: 'e6' },
    ];
    for (const move of enPassantMoves) {
      playLegalMove(game, move);
      expect(game.getBoard()[move.from]).toBeNull();
      expect(game.getBoard()[move.to]).toEqual({
        color: 'white',
        type: 'pawn',
      });
      expect(game.getBoard().e5).toBeNull();
      game.undoMove();
      expect(game.getBoard()[move.from]).toEqual({
        color: 'white',
        type: 'pawn',
      });
      expect(game.getBoard()[move.to]).toBeNull();
    }
    expect(game.getBoard().e5).toEqual({
      color: 'black',
      type: 'pawn',
    });
  });

  it('resets EnPassant properly', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '....k...',
        '....p...',
        '........',
        '...P.P..',
        '........',
        '........',
        '........',
        '....K...',
      ]),
      turn: 'black',
    });

    playLegalMove(game, { from: 'e7', to: 'e5' });

    const enPassantMoves: Move[] = [
      { from: 'd5', to: 'e6' },
      { from: 'f5', to: 'e6' },
    ];

    for (const move of enPassantMoves)
      expect(game.getLegalMoves()).toContainEqual(move);

    playLegalMove(game, { from: 'e1', to: 'e2' });
    playLegalMove(game, { from: 'e8', to: 'e7' });

    for (const move of enPassantMoves)
      expect(game.getLegalMoves()).not.toContainEqual(move);
  });

  it('detects check', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '.....k..',
        '........',
        '...QK...',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]),
    });

    const move: Move = { from: 'd6', to: 'd8' };

    playLegalMove(game, move);
    expect(game.isCheck()).toBeTruthy();
  });

  it('only provides non self-checking moves on check', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '.....k..',
        '........',
        '...QK...',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]),
    });

    const move: Move = { from: 'd6', to: 'd8' };

    playLegalMove(game, move);
    expect(game.isCheck()).toBeTruthy();

    expect(game.getLegalMoves()).toHaveLength(1);
    expect(game.getLegalMoves()).toContainEqual({ from: 'f8', to: 'g7' });
  });

  it('detects checkmate', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '....k...',
        '........',
        '..Q.K...',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]),
    });

    const move: Move = { from: 'c6', to: 'c8' };

    playLegalMove(game, move);
    expect(game.isCheckmate()).toBeTruthy();
  });

  it('detects stalemate', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '.......k',
        '........',
        '......KP',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]),
    });

    const move: Move = { from: 'h6', to: 'h7' };

    playLegalMove(game, move);
    expect(game.isStalemate()).toBeTruthy();
  });

  it('detects insufficient material', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '....k...',
        '........',
        '...QK...',
        '........',
        '........',
        '........',
        '........',
        '........',
      ]),
    });

    expect(game.isOver()).toBeFalsy();

    playLegalMove(game, { from: 'd6', to: 'd8' }); // ??
    expect(game.isCheck()).toBeTruthy();
    playLegalMove(game, { from: 'e8', to: 'd8' });
    expect(game.isInsufficientMaterial()).toBeTruthy();
  });

  it('detects insufficient material for knight', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '........',
        '........',
        '.....k..',
        '........',
        '........',
        '........',
        '....NKp.',
        '........',
      ]),
    });

    expect(game.isOver()).toBeFalsy();

    playLegalMove(game, { from: 'f2', to: 'g2' });
    // Only one knight remaining, game is over
    expect(game.isInsufficientMaterial()).toBeTruthy();
  });

  it('detects insufficient material for bishops', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '........',
        '......B.',
        '.....kB.',
        '........',
        '........',
        '........',
        '.....Kb.',
        '........',
      ]),
      turn: 'black'
    });

    expect(game.isCheck()).toBeTruthy();

    playLegalMove(game, { from: 'f6', to: 'g7' });
    // Insufficient material, bishops of same color
    expect(game.isInsufficientMaterial()).toBeTruthy();
    game.undoMove();

    playLegalMove(game, { from: 'f6', to: 'g6' });
    // Bishops of opposite colors, game might end up in checkmate
    expect(game.isOver()).toBeFalsy();
    playLegalMove(game, { from: 'f2', to: 'g2' });
    // Only one bishop left, game is over
    expect(game.isInsufficientMaterial()).toBeTruthy();
  });

  it('detects threefold repetition', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '........',
        '........',
        '.....k..',
        '.....p..',
        '.....P..',
        '.....K..',
        '........',
        '........',
      ]),
      castlingRights: {
        white: {
          queenside: false,
          kingside: false,
        },
        black: {
          queenside: false,
          kingside: false,
        },
      }
    });

    expect(game.canClaimDrawByThreefoldRepetition()).toBeFalsy();
    playLegalMove(game, { from: 'f3', to: 'e3' }); // 1
    playLegalMove(game, { from: 'f6', to: 'e6' });
    playLegalMove(game, { from: 'e3', to: 'f2' });
    playLegalMove(game, { from: 'e6', to: 'f6' });
    playLegalMove(game, { from: 'f2', to: 'e3' }); // 2
    playLegalMove(game, { from: 'f6', to: 'e6' });
    playLegalMove(game, { from: 'e3', to: 'f3' });
    playLegalMove(game, { from: 'e6', to: 'f6' });
    expect(game.canClaimDrawByThreefoldRepetition()).toBeFalsy();
    expect(game.isOver()).toBeFalsy();
    playLegalMove(game, { from: 'f3', to: 'e3' }); // 3
    expect(game.canClaimDrawByThreefoldRepetition()).toBeTruthy();
  });

  it('detects fivefold repetition', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '........',
        '........',
        '.....k..',
        '.....p..',
        '.....P..',
        '.....K..',
        '........',
        '........',
      ]),
      castlingRights: {
        white: {
          queenside: false,
          kingside: false,
        },
        black: {
          queenside: false,
          kingside: false,
        },
      }
    });

    expect(game.canClaimDrawByThreefoldRepetition()).toBeFalsy();
    playLegalMove(game, { from: 'f3', to: 'e3' }); // 1
    playLegalMove(game, { from: 'f6', to: 'e6' });
    playLegalMove(game, { from: 'e3', to: 'f2' });
    playLegalMove(game, { from: 'e6', to: 'f6' });
    playLegalMove(game, { from: 'f2', to: 'e3' }); // 2
    playLegalMove(game, { from: 'f6', to: 'e6' });
    playLegalMove(game, { from: 'e3', to: 'f3' });
    playLegalMove(game, { from: 'e6', to: 'f6' });
    playLegalMove(game, { from: 'f3', to: 'e3' }); // 3
    expect(game.canClaimDrawByThreefoldRepetition()).toBeTruthy();
    expect(game.isOver()).toBeFalsy();
    playLegalMove(game, { from: 'f6', to: 'g6' });
    playLegalMove(game, { from: 'e3', to: 'f2' });
    playLegalMove(game, { from: 'g6', to: 'f6' });
    playLegalMove(game, { from: 'f2', to: 'e3' }); // 4
    expect(game.isDrawByFivefoldRepetition()).toBeFalsy();
    playLegalMove(game, { from: 'f6', to: 'f7' });
    playLegalMove(game, { from: 'e3', to: 'f3' });
    playLegalMove(game, { from: 'f7', to: 'f6' });
    playLegalMove(game, { from: 'f3', to: 'e3' }); // 5
    expect(game.isDrawByFivefoldRepetition()).toBeTruthy();
    expect(game.isOver()).toBeTruthy();
  });

  it('handles fifty moves rule', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '........',
        '........',
        '....k...',
        '........',
        '........',
        '....BKN.',
        '........',
        '........',
      ]),
      halfMoves: 99,
    });

    expect(game.canClaimDrawByFiftyMoves()).toBeFalsy();
    playLegalMove(game, { from: 'e3', to: 'd4' });
    expect(game.canClaimDrawByFiftyMoves()).toBeTruthy();
  });

  it('handles seventy-five moves rule', () => {
    const game = new InternalGame({
      board: boardFromVisual([
        '........',
        '........',
        '....k...',
        '........',
        '........',
        '....BKN.',
        '........',
        '........',
      ]),
      halfMoves: 149,
    });

    expect(game.canClaimDrawByFiftyMoves()).toBeTruthy();
    expect(game.isDrawBySeventyFiveMoves()).toBeFalsy();
    expect(game.isOver()).toBeFalsy();
    playLegalMove(game, { from: 'e3', to: 'd4' });
    expect(game.isDrawBySeventyFiveMoves()).toBeTruthy();
    expect(game.isOver()).toBeTruthy();
  });
});

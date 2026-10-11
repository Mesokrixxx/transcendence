import { describe, expect, it } from 'vitest';
import InternalGame from '../src/internal-game';
import { GameStatus, type Move } from '../src/chessgame.types';

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
    expect(game.getGameStatus()).toBe(GameStatus.ONGOING);
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
    expect(game.getLegalMoves()).toContainEqual(move);
    game.makeMove(move);
    expect(game.getTurn()).toBe('black');
    expect(game.getGameStatus()).toBe(GameStatus.ONGOING);
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
      expect(game.getLegalMoves()).toContainEqual(move);
      game.makeMove(move);
      expect(game.getGameStatus()).toBe(GameStatus.ONGOING);
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
    game.makeMove({ from: 'a1', to: 'b1' });

    expect(game.getLegalMoves()).toContainEqual({ from: 'e8', to: 'g8' });
    expect(game.getLegalMoves()).toContainEqual({ from: 'e8', to: 'c8' });
    // Move Black's king
    game.makeMove({ from: 'e8', to: 'd8' });

    expect(game.getLegalMoves()).toContainEqual({ from: 'e1', to: 'g1' });
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e1', to: 'c1' });
    // Put White's rook back to its original place
    game.makeMove({ from: 'b1', to: 'a1' });

    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e8', to: 'g8' });
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e8', to: 'c8' });
    // Put Black's king back to its original place
    game.makeMove({ from: 'd8', to: 'e8' });

    // Still can't castle on the queenside
    expect(game.getLegalMoves()).toContainEqual({ from: 'e1', to: 'g1' });
    expect(game.getLegalMoves()).not.toContainEqual({ from: 'e1', to: 'c1' });
    // Castling isn't affected on the kingside
    game.makeMove({ from: 'e1', to: 'g1' });
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

    game.makeMove({ from: 'e7', to: 'e5' });
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
      expect(game.getLegalMoves()).toContainEqual(move);
      game.makeMove(move);
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

    game.makeMove({ from: 'e7', to: 'e5' });

    const enPassantMoves: Move[] = [
      { from: 'd5', to: 'e6' },
      { from: 'f5', to: 'e6' },
    ];

    for (const move of enPassantMoves)
      expect(game.getLegalMoves()).toContainEqual(move);

    game.makeMove({ from: 'e1', to: 'e2' });
    game.makeMove({ from: 'e8', to: 'e7' });

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

    expect(game.getLegalMoves()).toContainEqual(move);
    game.makeMove(move);
    expect(game.getGameStatus()).toBe(GameStatus.CHECK);
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

    expect(game.getLegalMoves()).toContainEqual(move);
    game.makeMove(move);
    expect(game.getGameStatus()).toBe(GameStatus.CHECK);

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

    expect(game.getLegalMoves()).toContainEqual(move);
    game.makeMove(move);
    expect(game.getGameStatus()).toBe(GameStatus.CHECKMATE);
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

    expect(game.getLegalMoves()).toContainEqual(move);
    game.makeMove(move);
    expect(game.getGameStatus()).toBe(GameStatus.STALEMATE);
  });
});

import { describe, expect, it } from 'vitest';
import ChessGame from '../src/chessgame';
import { GameStatus, type Move } from '../src/chessgame.types';

describe('ChessGame', () => {
  it('starts game in correct position', () => {
    const game = new ChessGame();

    expect(Object.values(game.getBoard())).toHaveLength(64);
    expect(game.getTurn()).toBe('white');
    expect(game.getMoves()).toHaveLength(20); // Pawn and knight moves
    expect(game.getHistory()).toHaveLength(0);
    expect(game.getGameStatus()).toBe(GameStatus.ONGOING);
  });

  it('plays legal move', () => {
    const game = new ChessGame();

    game.move({ from: 'e2', to: 'e4' });

    expect(game.getTurn()).toBe('black');
    expect(game.getBoard().e4).toEqual({
      color: 'white',
      type: 'pawn',
    });
    expect(game.getBoard().e2).toBeNull();
    expect(game.getHistory()).toEqual([
      { from: 'e2', to: 'e4' },
    ]);
    expect(game.getGameStatus()).toBe(GameStatus.ONGOING);
  });

  it('rejects invalid move and keep game unchanged', () => {
    const game = new ChessGame();

    const move: Move = { from: 'e2', to: 'e8', promotion: 'queen' } // Touchdown!!
    expect(() => game.move(move)).toThrow();
    expect(game.getTurn()).toBe('white');
    expect(game.getBoard().e2).toEqual({
      color: 'white',
      type: 'pawn',
    });
    expect(game.getHistory()).toHaveLength(0);
    expect(game.getGameStatus()).toBe(GameStatus.ONGOING);
  });

  it('plays castling properly', () => {
    const game = new ChessGame();

    const moves: Move[] = [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e5' },
      { from: 'g1', to: 'f3' },
      { from: 'b8', to: 'c6' },
      { from: 'f1', to: 'b5' },
      { from: 'g8', to: 'f6' },
      { from: 'e1', to: 'g1' },
    ];

    for (const move of moves) {
      const piece = game.getBoard()[move.from];
      expect(piece).not.toBeNull();
      expect(game.getMoves(move.from)).toContainEqual(move);
      game.move(move);
      expect(game.getBoard()[move.from]).toBeNull();
      expect(game.getBoard()[move.to]).toEqual(piece);
      expect(game.getGameStatus()).toBe(GameStatus.ONGOING);
    }
    expect(game.getHistory()).toEqual(moves);
    expect(game.getBoard().h1).toBeNull();
    expect(game.getBoard().f1).toEqual({
      color: 'white',
      type: 'rook',
    });
  });
});

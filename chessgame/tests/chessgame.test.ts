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
});

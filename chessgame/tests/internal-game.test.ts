import { describe, expect, it } from 'vitest';
import InternalGame from '../src/internal-game';
import { GameStatus, type Move } from '../src/chessgame.types';

// This test suite is designed to test cases from specific positions
// The InternalGame class will be instantiated with a custom board setup
// To play a game in a safe way, the ChessGame class should be used

/*
Default Board Visual from White's perspective
['rnbqkbnr',
'pppppppp',
'........',
'........',
'........',
'........',
'PPPPPPPP',
'RNBQKBNR']
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
});

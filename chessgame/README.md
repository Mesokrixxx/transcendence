# Chess Engine

A TypeScript chess game engine for ft_transcendence.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Concepts](#concepts)
  - [Color](#color)
  - [Piece](#piece)
  - [Square](#square)
  - [Move](#move)
  - [Board](#board)
- [API](#api)
  - [ChessGame](#chessgame)
    - [Constructor](#constructor)
    - [getBoard()](#getboard)
    - [getTurn()](#getturn)
    - [getMoves(square?: Square)](#getmovessquare-square)
    - [getHistory()](#gethistory)
    - [isLegalMove(move: Move)](#islegalmovemove-move)
    - [move(move: Move)](#movemove-move)
  - [Game State](#game-state)
    - [getGameStatus()](#getgamestatus)
    - [isOver()](#isover)
    - [isCheck()](#ischeck)
    - [isCheckmate()](#ischeckmate)
  - [Draws](#draws)
    - [isDraw()](#isdraw)
    - [getDrawReason()](#getdrawreason)
    - [canClaimDraw()](#canclaimdraw)
- [Complete Example](#complete-example)

---

## Overview

This library provides a simple interface to play a Chess game without UI.

It handles move generation and validation, detects end-of-game conditions such as checkmates or draws and provides a history of the moves played.

## Quick Start

```ts
import { ChessGame } from 'chessgame.js';

const game = new ChessGame();

game.move({ from: 'e2', to: 'e4' });

console.log(game.getTurn()); // 'black'
```

## Concepts

The main public types used and returned by the API.

### Color

```ts
type Color = 'white' | 'black';
```

### Piece

```ts
interface Piece {
  color: Color;
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
}
```

### Square

```ts
// prettier-ignore
type Square = 
  | "a1" | "b1" | "c1" | "d1" | "e1" | "f1" | "g1" | "h1"
  | "a2" | "b2" | "c2" | "d2" | "e2" | "f2" | "g2" | "h2"
  | "a3" | "b3" | "c3" | "d3" | "e3" | "f3" | "g3" | "h3"
  | "a4" | "b4" | "c4" | "d4" | "e4" | "f4" | "g4" | "h4"
  | "a5" | "b5" | "c5" | "d5" | "e5" | "f5" | "g5" | "h5"
  | "a6" | "b6" | "c6" | "d6" | "e6" | "f6" | "g6" | "h6"
  | "a7" | "b7" | "c7" | "d7" | "e7" | "f7" | "g7" | "h7"
  | "a8" | "b8" | "c8" | "d8" | "e8" | "f8" | "g8" | "h8";
```

The notation used for all board squares. `a1` is the bottom left square and `h8` is the top right square.

### Move

```ts
interface Move {
  from: Square;
  to: Square;
  promotion?: 'queen' | 'rook' | 'bishop' | 'knight';
}
```

Represents a move in a game. `from` is the `Square` occupied by the piece before the move, while `to` is the destination `Square`.

`promotion` must only be specified when a pawn is promoted.

### Board

```ts
type Board = Record<Square, Piece | null>;
```

An object representing the state of the board. It contains an entry for each `Square`, each entry contains either the `Piece` occupying that `Square` or `null` if the square is empty.

## API

The API consists of a set of methods to interact with the Chess game.

### ChessGame

Main methods for playing a game.

#### Constructor

The constructor provides two ways to start a game.

Calling the constructor without arguments starts a new game from the standard starting position.

Passing an array of `Move`s will reconstruct a game from those moves.

```ts
// Default starting position
const game1 = new ChessGame();

game1.move({ from: 'e2', to: 'e4' });

// Initializes the game from the given list of moves
const game2 = new ChessGame([{ from: 'e2', to: 'e4' }]);

// game1 and game2 are now in the same state
```

#### getBoard()

Returns a representation of the current board state.

```ts
const game = new ChessGame();

const board = game.getBoard();
board.e2; // { color: 'white', type: 'pawn' }
board.e4; // null
```

#### getTurn()

Returns the `Color` of the player that has the move.

```ts
const game = new ChessGame();

game.getTurn(); // 'white'
```

#### getMoves(square?: Square)

Returns an array containing all legal `Move`s for the current position.

If called with a `Square` argument, it only returns the moves available from that square.

```ts
const game = new ChessGame();

game.getMoves();
// [
//  ...
//  { from: 'd2', to: 'd3' },
//  { from: 'd2', to: 'd4' },
//  { from: 'e2', to: 'e3' },
//  { from: 'e2', to: 'e4' },
//  ...
// ]

game.getMoves('b1');
// [
//  { from: 'b1', to: 'a3' },
//  { from: 'b1', to: 'c3' },
// ]

game.getMoves('e1'); // []
```

#### getHistory()

Returns an array containing all moves played since the beginning of the game.

```ts
const game = new ChessGame();

game.getHistory(); // []

game.move({ from: 'e2', to: 'e4' });

game.getHistory(); // [{ from: 'e2', to: 'e4' }]
```

#### isLegalMove(move: Move)

Returns `true` if the move is legal and `false` otherwise.

```ts
const game = new ChessGame();

game.isLegalMove({ from: 'e2', to: 'e4' }); // true
game.isLegalMove({ from: 'e2', to: 'e5' }); // false
```

#### move(move: Move)

Plays the given move.

Throws an exception if the move is illegal.

```ts
const game = new ChessGame();

game.move({ from: 'e2', to: 'e4' });

game.move({ from: 'e7', to: 'e4' }); // Throws
```

### Game State

Methods for checking the current game state.

#### getGameStatus()

The API exposes a `GameStatus` enum, which can have one of four values:

| Status   | Meaning                                         |
| -------- | ----------------------------------------------- |
| ONGOING  | The game can continue from the current position |
| DRAW     | The game ended in an automatic draw             |
| WHITEWON | White won by checkmate                          |
| BLACKWON | Black won by checkmate                          |

`getGameStatus()` returns the current game status.

```ts
const game = new ChessGame();

game.getGameStatus(); // GameStatus.ONGOING
```

#### isOver()

Returns `true` if the current game is over (meaning `getGameStatus() !== GameStatus.ONGOING`) and `false` otherwise.

```ts
const game = new ChessGame();

game.isOver(); // false
```

#### isCheck()

Returns `true` if the player that has the move is in check.

Checkmate is a special case of check, so `isCheck()` also returns `true` when the player is checkmated.

```ts
const game = new ChessGame();

game.isCheck(); // false
```

#### isCheckmate()

Returns `true` if the player that has the move has been checkmated. If `true`, `getGameStatus()` is either `GameStatus.WHITEWON` or `GameStatus.BLACKWON`.

```ts
const game = new ChessGame();

game.isCheckmate(); // false
```

### Draws

A Chess game can end in a draw in several ways. The API provides a few methods to handle them all.

The API makes the differences between two types of draws:

- Automatic draws: Draws that are automatically declared based on the current position or game history. When reached, the game status automatically switches to `GameStatus.DRAW`. The different automatic draws are:

| Name                  | Meaning                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| Stalemate             | The player that has the move has no legal move and is not in check         |
| Insufficient material | The remaining material is not theoretically enough for checkmate to happen |
| Fivefold repetition   | The same position occurred five times during the game                      |
| Seventy-five moves    | At least seventy-five moves were played without a pawn move or capture     |

- Claimable draws: Situations based on the game history that allow either player to claim a draw. They are not forced, thus, the game status will remain `GameStatus.ONGOING`. The different claimable draws are:

| Name                 | Meaning                                                         |
| -------------------- | --------------------------------------------------------------- |
| Threefold Repetition | The same position occurred three times during the game          |
| Fifty moves          | At least fifty moves were played without a pawn move or capture |

#### isDraw()

Returns `true` if an automatic draw pattern occurred and `false` otherwise.

```ts
const game = new ChessGame();

game.isDraw(); // false
```

#### getDrawReason()

Returns the reason for the draw if the game status is `GameStatus.DRAW`, or null otherwise.

```ts
const game = new ChessGame();

game.getDrawReason(); // null
```

#### canClaimDraw()

Returns an array containing all draws that currently can be claimed. If the returned array is empty, no draw can currently be claimed.

```ts
const game = new ChessGame();

game.canClaimDraw(); // []
```

## Complete Example

Here is a complete program example that uses the `ChessGame` API to simulate a random game of Chess.

```ts
import { ChessGame, GameStatus } from 'chessgame.js';

const game = new ChessGame();

while (!game.isOver()) {
  const moves = game.getMoves();
  game.move(moves[Math.floor(Math.random() * moves.length)]);
}

if (game.isDraw()) console.log('The game is a draw!');
else
  console.log(
    `${game.getGameStatus() === GameStatus.WHITEWON ? 'White' : 'Black'} won!`,
  );
console.log(
  `The game lasted ${Math.ceil(game.getHistory().length / 2)} moves!`,
);
```

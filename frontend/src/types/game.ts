export enum GameStatus {
  WAITING,
  PLAYING,
  OVER
}

export enum GameResult {
  DRAW,
  WHITE,
  BLACK
}

export enum GameEndType {
  CHECKMATE,
  FORFEIT,
  TIMEFORFEIT,
  STALEMATE,
  INSUFMATERIAL,
  TRIPLEREPETITION,
  FIFTYMOVE
}

interface GameUser {
  username: string,
  elo: number,
}

export interface Game {
  id: number,
  status: GameStatus,
  result?: GameResult,
  endType?: GameEndType,
  createdAt: Date,
  startedAt: Date,
  endedAt?: Date,
  moves: string,
  white: GameUser,
  whiteId: number,
  black: GameUser,
  blackId: number,
};

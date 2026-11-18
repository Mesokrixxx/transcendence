export enum GameStatus {
  WAITING,
  PLAYING,
  OVER,
}

export enum GameResult {
  DRAW,
  WHITE,
  BLACK,
}

export enum GameEndType {
  CHECKMATE,
  FORFEIT,
  TIMEFORFEIT,
  STALEMATE,
  INSUFMATERIAL,
  TRIPLEREPETITION,
  FIFTYMOVE,
}

interface GameUser {
  username: string;
  elo: number;
  maxElo: number;
  profile: {
    displayName: string | null;
  } | null;
}

export interface Game {
  id: number;
  status: GameStatus;
  result: GameResult | null;
  endType: GameEndType | null;
  createdAt: Date;
  startedAt: Date;
  endedAt: Date | null;
  moves: string;
  white: GameUser;
  whiteId: number;
  whiteElo: number;
  black: GameUser;
  blackId: number;
  blackElo: number;
}

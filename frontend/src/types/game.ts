export enum GameStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  OVER = 'OVER',
}

export enum GameResult {
  DRAW = 'DRAW',
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

export enum GameEndType {
  CHECKMATE = 'CHECKMATE',
  FORFEIT = 'FORFEIT',
  TIMEFORFEIT = 'TIMEFORFEIT',
  STALEMATE = 'STALEMATE',
  INSUFMATERIAL = 'INSUFMATERIAL',
  TRIPLEREPETITION = 'TRIPLEREPETITION',
  FIFTYMOVE = 'FIFTYMOVE',
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
  startedAt: Date | null;
  endedAt: Date | null;
  moves: string;
  white: GameUser;
  whiteId: number;
  whiteElo: number;
  black: GameUser;
  blackId: number;
  blackElo: number;
}

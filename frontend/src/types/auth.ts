export type AuthUser = {
  id: number;
  username: string;
  email: string;
  elo?: number;
  gamesPlayed?: number;
  maxElo?: number;
};

export type AuthenticatedUser = {
  id: number;
  username: string;
  email: string;
  elo: number;
  gamesPlayed: number;
  maxElo: number;
};

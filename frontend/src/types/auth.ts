export type AuthUser = {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  displayName?: string | null;
  elo?: number;
  gamesPlayed?: number;
  maxElo?: number;
};

import fetchAPI from './fetchAPI';

export type PlayerProfile = {
  id: number;
  username: string;
  avatar: string | null;
  displayName: string | null;
  elo: number;
  gamesPlayed: number;
};

export function getPlayerProfile(id: number) {
  return fetchAPI<PlayerProfile>({
    path: `/users/${id}`,
    method: 'get',
  });
}
import fetchAPI from "../../services/fetchAPI"
import type { APIError } from "../../types/fetch"

export type Player = {
  id: number
  username: string
  rating: number
  wins: number
  games: number
  avatar?: string
  isOnline?: boolean
}

const fakePlayers: Player[] = [
  {
    id: 1,
    username: 'alice',
    rating: 1842,
    wins: 42,
    games: 60,
    isOnline: true,
    avatar: '/avatars/queen.svg',
  },
  {
    id: 2,
    username: 'bob',
    rating: 1755,
    wins: 35,
    games: 55,
    isOnline: false,
    avatar: '/avatars/king.svg',
  },
  {
    id: 3,
    username: 'charlie',
    rating: 1610,
    wins: 20,
    games: 48,
    avatar: '/avatars/knight.svg',
  },
  {
    id: 4,
    username: 'jack',
    rating: 1440,
    wins: 15,
    games: 35,
    isOnline: true,
  },
  {
    id: 5,
    username: 'diana',
    rating: 1300,
    wins: 12,
    games: 30,
    isOnline: false,
  },
  { id: 6,
    username: 'sofia',
    rating: 1210,
    wins: 10,
    games: 25
  },
];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getFakeRankings(): Promise<Player[]> {
  await wait(500)
  return fakePlayers
}

function getErrorMessage(error: APIError): string {
  return typeof error === 'string' ? error : error.error;
}

const USE_FAKE_DATA = false;

export async function getRankings(): Promise<Player[]> {
  if (USE_FAKE_DATA){
    return getFakeRankings();
  }

  const response = await fetchAPI<Player[]>({
    path: '/users',
    method: 'get',
  })

  if (response.error) {
    throw new Error(getErrorMessage(response.result))
  }

  return response.result
}
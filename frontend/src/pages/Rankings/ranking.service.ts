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
    {id: 1, username: 'alice', rating: 1842, wins:42, games: 60, isOnline: true, avatar: '/avatars/queen.svg'},
    {id: 2, username: 'bob', rating: 1755, wins: 35, games: 55, isOnline: false, avatar: '/avatars/king.svg'},
    {id: 3, username: 'charlie', rating: 1610, wins: 20, games: 48, avatar: '/avatars/knight.svg'},
    {id: 4, username: 'jack', rating: 1440, wins: 15, games: 35, isOnline: true},
    {id: 5, username: 'diana', rating: 1300, wins: 12, games: 30, isOnline: false,},
    {id: 6, username: 'sofia', rating: 1210, wins: 10, games: 25},
]

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getRankings(): Promise<Player[]> {
  await wait(500)
  return fakePlayers
}
import fetchAPI from './fetchAPI'
import type { APIError } from '../types/fetch'

export type Player = {
  id: number
  username: string
  displayName?: string | null
  rating: number
  wins: number
  games: number
  avatar?: string
}

function getErrorMessage(error: APIError): string {
  return typeof error === 'string' ? error : error.error
}

export async function getRankings(): Promise<Player[]> {
  const response = await fetchAPI<Player[]>({
    path: '/users',
    method: 'get',
  })

  if (response.error) {
    throw new Error(getErrorMessage(response.result))
  }

  return response.result
}
import fetchAPI from "./fetchAPI";
import { faker } from '@faker-js/faker';
import { GameEndType, GameResult, GameStatus, type Game } from "../types/game";

export async function getUserGames(userId: number):  Promise<Game[] | null> {
  const response = await fetchAPI<Game[]>({
    path: `/users/${userId}/games`,
    method: 'get',
  });
  if (response.error) return null;
  return (response.result);
}

export function getFakeGames(size: number = 100): Game[] {
  function getFakeGameUser() {
    return {
      username: faker.internet.username(),
      elo: faker.number.int({ min: 100, max: 3000 }),
    };
  }
  const games: Game[] = [];

  for (let i = 0; i < size; i++) {
    const createdAt = faker.date.recent();
    const startedAt = faker.date.between({
      from: createdAt,
      to: Date.now(),
    });
    const endedAt = faker.date.between({
      from: startedAt,
      to: Date.now(),
    });

    games.push({
      id: faker.number.int(),
      status: faker.number.int({ min: GameStatus.WAITING, max: GameStatus.OVER }),
      result: faker.number.int({ min: GameResult.DRAW, max: GameResult.BLACK }),
      endType: faker.number.int({ min: GameEndType.CHECKMATE, max: GameEndType.FIFTYMOVE }),
      createdAt,
      startedAt,
      endedAt,
      moves: '',
      white: getFakeGameUser(),
      whiteId: faker.number.int(),
      black: getFakeGameUser(),
      blackId: faker.number.int(),
    });
  }

  return getFakeGames();
}

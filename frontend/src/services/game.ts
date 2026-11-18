import fetchAPI from "./fetchAPI";
import { faker } from '@faker-js/faker';
import { GameEndType, GameResult, GameStatus, type Game } from "../types/game";
import ChessGame from "../../../chessgame/src/chessgame";

export async function getUserGames(userId: number):  Promise<Game[] | null> {
  const response = await fetchAPI<Game[]>({
    path: `/users/${userId}/games`,
    method: 'get',
  });
  if (response.error) return null;
  return (response.result);
}

export function getFakeGames({ userId, size = 100 }: { userId?: number, size?: number }): Game[] {
  function getFakeGameUser() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      username: faker.internet.username({ firstName, lastName }),
      elo: faker.number.int({ min: 100, max: 3000 }),
      profile: {
        displayName: faker.person.fullName({ firstName, lastName })
      }
    };
  }
  const games: Game[] = [];

  for (let i = 0; i < size; i++) {
    const game = new ChessGame();

    while (!game.isOver()) {
      const moves = game.getMoves();
      game.move(moves[Math.floor(Math.random() * moves.length)]);
    }

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
      moves: JSON.stringify(game.getHistory()),
      white: getFakeGameUser(),
      whiteId: i % 2 === 0 && userId !== undefined ? userId : faker.number.int(),
      whiteElo: faker.number.int({ min: 100, max: 3000 }),
      black: getFakeGameUser(),
      blackId: i % 2 !== 0 && userId !== undefined ? userId : faker.number.int(),
      blackElo: faker.number.int({ min: 100, max: 3000 }),
    });
  }

  return games;
}

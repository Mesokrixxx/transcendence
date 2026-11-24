import fetchAPI from "./fetchAPI";
// import { faker } from '@faker-js/faker';
import type { Game } from "../types/game";
// import { GameEndType, GameResult, GameStatus } from "../types/game";
// import ChessGame from "../../../chessgame/src/chessgame";

type GameFromApi = Omit<Game, 'endedAt'> & {
  endedAt: string | null;
};

export async function getUserGames(userId: number): Promise<Game[] | null> {
  const response = await fetchAPI<GameFromApi[]>({
    path: `/users/${userId}/games`,
    method: 'get',
  });

  if (response.error || !response.result) return null;

  return response.result.map((game) => ({
    ...game,
    createdAt: new Date(game.createdAt),
    startedAt: game.startedAt === null ? null : new Date(game.startedAt),
    endedAt: game.endedAt === null ? null : new Date(game.endedAt),
  }));
}

/*
export function getFakeGames({ userId, size = 100 }: { userId?: number, size?: number }): Game[] {
  const statuses: GameStatus[] = [GameStatus.WAITING, GameStatus.PLAYING, GameStatus.OVER];
  const results: GameResult[] = [GameResult.DRAW, GameResult.WHITE, GameResult.BLACK];
  const endTypes: GameEndType[] = [GameEndType.CHECKMATE, GameEndType.FORFEIT, GameEndType.TIMEFORFEIT, GameEndType.STALEMATE, GameEndType.INSUFMATERIAL, GameEndType.TRIPLEREPETITION, GameEndType.FIFTYMOVE];

  function getFakeGameUser() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const elo = faker.number.int({ min: 100, max: 3000 });
    return {
      username: faker.internet.username({ firstName, lastName }),
      elo,
      maxElo: faker.number.int({ min: elo, max: 3000 }),
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
      status: statuses[faker.number.int({ min: 0, max: statuses.length - 1 })],
      result: results[faker.number.int({ min: 0, max: results.length - 1})],
      endType: endTypes[faker.number.int({ min: 0, max: endTypes.length - 1 })],
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
*/

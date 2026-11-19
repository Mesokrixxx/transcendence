import EloChart from '../EloChart/EloChart';
import EloCard from '../EloCard/EloCard';
import { GameStatus, type Game } from '../../../types/game';
import * as S from './Progression.styles';

interface ProgressionProps {
  games: Game[];
  userId: number;
}

interface EloProgression {
  current: number;
  max: number;
  evolution: number[];
}

function getEloProgression(
  games: Game[],
  userId: number,
  limit?: number,
): EloProgression {
  const defaultElo = 1400;
  const sortedGames = games
    .filter(
      (g) =>
        g.status === GameStatus.OVER &&
        g.endedAt !== null &&
        (g.whiteId === userId || g.blackId === userId),
    )
    .sort((a, b) => a.endedAt!.getTime() - b.endedAt!.getTime());
  if (sortedGames.length === 0)
    return { current: defaultElo, max: defaultElo, evolution: [] };

  const limitedGames = limit ? sortedGames.slice(-limit) : sortedGames;

  const eloEvolution: number[] = limitedGames.map((g) => g.whiteId === userId ? g.whiteElo : g.blackElo);

  const lastGame = sortedGames[sortedGames.length - 1];
  const user = lastGame.whiteId === userId ? lastGame.white : lastGame.black;
  return {
    current: user.elo,
    max: user.maxElo,
    evolution: [...eloEvolution, user.elo],
  }
}

function Progression({ games, userId }: ProgressionProps) {
  const eloProgression = getEloProgression(games, userId, 20);
  return (
    <S.Progression>
      <S.EloSummary>
        <EloCard title="Current ELO" value={eloProgression.current} />
        <EloCard title="Peak ELO" value={eloProgression.max} />
      </S.EloSummary>
      {eloProgression.evolution.length > 1 ? (
        <EloChart evolution={eloProgression.evolution} />
      ) : (
        <S.EmptyChart>No games played yet.</S.EmptyChart>
      )}
    </S.Progression>
  );
}

export default Progression;

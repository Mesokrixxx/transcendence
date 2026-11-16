import StreakCard from '../StreakCard/StreakCard';
import { GameResult, type Game } from '../../../types/game';
import * as S from './GameStreaksStats.styles';

interface GameStreaksStatsProps {
  games: Game[];
  userId: number;
}

type Result = 'win' | 'loss' | 'draw';

interface GameStreaks {
  longestWinStreak: number;
  longestLossStreak: number;
  longestDrawStreak: number;
  currentStreak: {
    result: Result | null;
    count: number;
  };
}

function getGameStreaks(games: Game[], userId: number): GameStreaks {
  const orderedGames = games
    .filter(
      (g) =>
        g.result !== null &&
        g.endedAt !== null &&
        (g.whiteId === userId || g.blackId === userId),
    )
    .sort((a, b) => a.endedAt!.getTime() - b.endedAt!.getTime());
  const results: Result[] = orderedGames.map((g) => {
    if (
      (g.result === GameResult.WHITE && g.whiteId === userId) ||
      (g.result === GameResult.BLACK && g.blackId === userId)
    )
      return 'win';
    if (g.result === GameResult.DRAW) return 'draw';
    return 'loss';
  });

  const streaks: GameStreaks = {
    longestWinStreak: 0,
    longestLossStreak: 0,
    longestDrawStreak: 0,
    currentStreak: {
      result: null,
      count: 0,
    },
  };

  results.forEach((r) => {
    if (r !== streaks.currentStreak.result)
      streaks.currentStreak = { result: r, count: 1 };
    else ++streaks.currentStreak.count;
    if (r === 'win' && streaks.currentStreak.count > streaks.longestWinStreak)
      streaks.longestWinStreak = streaks.currentStreak.count;
    else if (
      r === 'loss' &&
      streaks.currentStreak.count > streaks.longestLossStreak
    )
      streaks.longestLossStreak = streaks.currentStreak.count;
    else if (
      r === 'draw' &&
      streaks.currentStreak.count > streaks.longestDrawStreak
    )
      streaks.longestDrawStreak = streaks.currentStreak.count;
  });

  return streaks;
}

function GameStreaksStats({ games, userId }: GameStreaksStatsProps) {
  const streaks = getGameStreaks(games, userId);

  return (
    <S.GameStreaksStats>
      <StreakCard
        title="Winning streak"
        value={streaks.longestWinStreak}
        description="Consecutive wins"
      />
      <StreakCard
        title="Losing streak"
        value={streaks.longestLossStreak}
        description="Consecutive losses"
      />
      <StreakCard
        title="Drawing streak"
        value={streaks.longestDrawStreak}
        description="Consecutive draws"
      />
      <StreakCard
        title="Current streak"
        value={
          streaks.currentStreak.result
            ? `${streaks.currentStreak.result.toUpperCase()} x ${streaks.currentStreak.count}`
            : '-'
        }
        description="Current consecutive results"
      />
    </S.GameStreaksStats>
  );
}

export default GameStreaksStats;

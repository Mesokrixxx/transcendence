import GameResultsStats from './GameResultsStats/GameResultsStats';
import GameTerminationStats from './GameTerminationStats/GameTerminationStats';
import FavoriteOpponentsStats from './FavoriteOpponentsStats/FavoriteOpponentsStats';
import GameStreaksStats from './GameStreaksStats/GameStreaksStats';
import Progression from './Progression/Progression';
import { GameStatus, type Game } from '../../types/game';
import * as S from './Statistics.styles';

interface StatisticsProps {
  games: Game[];
  userId: number;
}

function Statistics({ games, userId }: StatisticsProps) {
  const gamesData = games.filter(
    (g) =>
      (g.whiteId === userId || g.blackId === userId) &&
      g.status === GameStatus.OVER,
  );

  return (
    <S.Statistics>
      <S.Stat>
        <S.StatTitle>Progression</S.StatTitle>
        <Progression games={gamesData} userId={userId} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>Game Results</S.StatTitle>
        <GameResultsStats games={gamesData} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>Game Terminations</S.StatTitle>
        <GameTerminationStats games={gamesData} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>Favorite Opponents</S.StatTitle>
        <FavoriteOpponentsStats games={gamesData} userId={userId} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>Game Streaks</S.StatTitle>
        <GameStreaksStats games={gamesData} userId={userId} />
      </S.Stat>
    </S.Statistics>
  );
}

export default Statistics;

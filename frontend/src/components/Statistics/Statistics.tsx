import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('statistics');
  const gamesData = games.filter(
    (g) =>
      (g.whiteId === userId || g.blackId === userId) &&
      g.status === GameStatus.OVER,
  );

  return (
    <S.Statistics>
      <S.Stat>
        <S.StatTitle>{t('progression')}</S.StatTitle>
        <Progression games={gamesData} userId={userId} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>{t('gameResults')}</S.StatTitle>
        <GameResultsStats games={gamesData} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>{t('gameTerminations')}</S.StatTitle>
        <GameTerminationStats games={gamesData} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>{t('favoriteOpponents')}</S.StatTitle>
        <FavoriteOpponentsStats games={gamesData} userId={userId} />
      </S.Stat>
      <S.Stat>
        <S.StatTitle>{t('gameStreaks')}</S.StatTitle>
        <GameStreaksStats games={gamesData} userId={userId} />
      </S.Stat>
    </S.Statistics>
  );
}

export default Statistics;

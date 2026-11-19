import { useTranslation } from 'react-i18next';
import { GameResult, type Game } from '../../../types/game';
import SegmentedBar from '../SegmentedBar/SegmentedBar';
import SegmentedBarLegend from '../SegmentedBarLegend/SegmentedBarLegend';
import * as S from './GameResultsStats.styles';

function GameResultsStats({ games }: { games: Game[] }) {
  const { t } = useTranslation(['statistics', 'chess']);
  const whiteWins = games.filter((g) => g.result === GameResult.WHITE).length;
  const blackWins = games.filter((g) => g.result === GameResult.BLACK).length;
  const draws = games.filter((g) => g.result === GameResult.DRAW).length;
  const total = whiteWins + blackWins + draws;

  const segments = [
    {
      label: t('white', { ns: 'chess' }),
      value: whiteWins,
      color: 'var(--color-board-light)',
    },
    {
      label: t('draw', { ns: 'chess' }),
      value: draws,
      color: 'var(--color-primary)',
    },
    {
      label: t('black', { ns: 'chess' }),
      value: blackWins,
      color: 'var(--color-board-dark)',
    },
  ];

  const displayedSegments = segments.filter((s) => s.value > 0);

  return (
    <S.GameResultsStats>
      {displayedSegments.length > 0 ? (
        <>
          <SegmentedBar segments={displayedSegments} />
          <SegmentedBarLegend segments={displayedSegments} total={total} />
        </>
      ) : (
        <S.InsufficientData>{t('noGamesPlayed')}</S.InsufficientData>
      )}
    </S.GameResultsStats>
  );
}

export default GameResultsStats;

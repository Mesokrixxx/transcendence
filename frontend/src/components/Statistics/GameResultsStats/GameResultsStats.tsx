import { GameResult, type Game } from '../../../types/game';
import SegmentedBar from '../SegmentedBar/SegmentedBar';
import SegmentedBarLegend from '../SegmentedBarLegend/SegmentedBarLegend';
import * as S from './GameResultsStats.styles';

function GameResultsStats({ games }: { games: Game[] }) {
  const whiteWins = games.filter((g) => g.result === GameResult.WHITE).length;
  const blackWins = games.filter((g) => g.result === GameResult.BLACK).length;
  const draws = games.filter((g) => g.result === GameResult.DRAW).length;
  const segments = [
    {
      label: 'white',
      value: whiteWins,
      color: 'white',
    },
    {
      label: 'draw',
      value: draws,
      color: 'gray',
    },
    {
      label: 'black',
      value: blackWins,
      color: 'black',
    },
  ];

  const displayedSegments = segments.filter((s) => s.value > 0);

  return (
    <S.GameResultsStats>
      {displayedSegments.length > 0 ? (
        <>
          <SegmentedBar segments={displayedSegments} />
          <SegmentedBarLegend
            segments={displayedSegments}
            total={games.length}
          />
        </>
      ) : (
        <S.InsufficientData>No games played yet.</S.InsufficientData>
      )}
    </S.GameResultsStats>
  );
}

export default GameResultsStats;

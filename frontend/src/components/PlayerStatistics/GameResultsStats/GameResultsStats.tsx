import { GameResult, type Game } from '../../../types/game';
import SegmentedBar from '../SegmentedBar/SegmentedBar';
import SegmentedBarLegend from '../SegmentedBarLegend/SegmentedBarLegend';
import * as S from './GameResultsStats.styles';

function GameResultsStats({ games }: { games: Game[] }) {
  const whiteWins = games.filter((g) => g.result === GameResult.WHITE).length;
  const blackWins = games.filter((g) => g.result === GameResult.BLACK).length;
  const draws = games.length - whiteWins - blackWins;
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

  return (
    <S.StyledGameResultsStats>
      <SegmentedBar segments={segments} />
      <SegmentedBarLegend segments={segments} total={games.length} />
    </S.StyledGameResultsStats>
  );
}

export default GameResultsStats;

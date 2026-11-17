import SegmentedBar from '../SegmentedBar/SegmentedBar';
import SegmentedBarLegend from '../SegmentedBarLegend/SegmentedBarLegend';
import { GameEndType, type Game } from '../../../types/game';
import * as S from './GameTerminationStats.styles';

const gameEndTypes = {
  [GameEndType.CHECKMATE]: {
    label: 'checkmate',
    color: 'white',
  },
  [GameEndType.FORFEIT]: {
    label: 'forfeit',
    color: 'gray',
  },
  [GameEndType.TIMEFORFEIT]: {
    label: 'time forfeit',
    color: 'black',
  },
  [GameEndType.STALEMATE]: {
    label: 'stalemate',
    color: 'purple',
  },
  [GameEndType.INSUFMATERIAL]: {
    label: 'insufficient material',
    color: 'yellow',
  },
  [GameEndType.TRIPLEREPETITION]: {
    label: 'threefold repetition',
    color: 'brown',
  },
  [GameEndType.FIFTYMOVE]: {
    label: 'fifty-moves',
    color: 'cyan',
  },
} satisfies Record<GameEndType, { label: string, color: string }>;

function GameTerminationStats({ games }: { games: Game[] }) {
  const segments = Object.entries(gameEndTypes).map(([endType, data]) => {
    return {
      type: Number(endType) as GameEndType,
      label: data.label,
      color: data.color,
      value: 0,
    }
  });

  games.forEach((g) => {
    const endType = g.endType;
    if (endType === null)
      return;

    const segment = segments.find((s) => s.type === endType);
    if (segment)
      ++segment.value;
  });

  const displayedSegments = segments
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <S.GameTerminationStats>
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
    </S.GameTerminationStats>
  );
}

export default GameTerminationStats;

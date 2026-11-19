import SegmentedBar from '../SegmentedBar/SegmentedBar';
import SegmentedBarLegend from '../SegmentedBarLegend/SegmentedBarLegend';
import { GameEndType, type Game } from '../../../types/game';
import * as S from './GameTerminationStats.styles';

const gameEndTypes = {
  [GameEndType.CHECKMATE]: {
    label: 'checkmate',
    color: 'var(--color-primary)',
  },
  [GameEndType.FORFEIT]: {
    label: 'forfeit',
    color: 'var(--color-primary)',
  },
  [GameEndType.TIMEFORFEIT]: {
    label: 'time forfeit',
    color: 'var(--color-primary)',
  },
  [GameEndType.STALEMATE]: {
    label: 'stalemate',
    color: 'var(--color-board-dark)',
  },
  [GameEndType.INSUFMATERIAL]: {
    label: 'insufficient material',
    color: 'var(--color-board-dark)',
  },
  [GameEndType.TRIPLEREPETITION]: {
    label: 'threefold repetition',
    color: 'var(--color-board-dark)',
  },
  [GameEndType.FIFTYMOVE]: {
    label: 'fifty-moves',
    color: 'var(--color-board-dark)',
  },
} satisfies Record<GameEndType, { label: string; color: string }>;

function GameTerminationStats({ games }: { games: Game[] }) {
  const segments = Object.entries(gameEndTypes).map(([endType, data]) => {
    return {
      type: Number(endType) as GameEndType,
      label: data.label,
      color: data.color,
      value: 0,
    };
  });

  games.forEach((g) => {
    const endType = g.endType;
    if (endType === null) return;

    const segment = segments.find((s) => s.type === endType);
    if (segment) ++segment.value;
  });

  const displayedSegments = segments
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const gamesCount = displayedSegments.reduce(
    (count, segment) => count + segment.value,
    0,
  );

  return (
    <S.GameTerminationStats>
      {displayedSegments.length > 0 ? (
        <>
          <SegmentedBar segments={displayedSegments} />
          <SegmentedBarLegend
            segments={displayedSegments}
            total={gamesCount}
          />
        </>
      ) : (
        <S.InsufficientData>No games played yet.</S.InsufficientData>
      )}
    </S.GameTerminationStats>
  );
}

export default GameTerminationStats;

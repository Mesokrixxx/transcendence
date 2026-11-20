import * as S from './SegmentedBar.styles';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface SegmentedBarProps {
  segments: Segment[];
}

function SegmentedBar({ segments }: SegmentedBarProps) {
  return (
    <S.SegmentedBar>
      {segments.map((s) => (
        <S.Segment key={s.label} $color={s.color} $value={s.value} />
      ))}
    </S.SegmentedBar>
  );
}

export default SegmentedBar;

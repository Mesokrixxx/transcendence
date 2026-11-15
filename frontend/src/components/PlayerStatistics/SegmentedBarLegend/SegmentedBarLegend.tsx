import * as S from './SegmentedBarLegend.styles';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface SegmentedBarLegendProps {
  segments: Segment[];
  total: number;
}

function SegmentedBarLegend({ segments, total }: SegmentedBarLegendProps) {
  return (
    <S.Legend>
      {segments.map((s) => {
        const percentage = total > 0 ? (s.value / total) * 100 : 0;
        return (
          <S.Item key={s.label}>
            <S.Label>
              <S.Indicator $color={s.color} />
              {s.label}
            </S.Label>

            <S.Percentage>{percentage.toFixed(1)}%</S.Percentage>

            <S.Count>({s.value})</S.Count>
          </S.Item>
        );
      })}
    </S.Legend>
  );
}

export default SegmentedBarLegend;

import * as S from './EloChart.styles';

interface Chart {
  width: number;
  height: number;
  padding: Padding;
  yMin: number;
  yMax: number;
}
interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Point {
  x: number;
  y: number;
}

function getY(
  e: number,
  {
    height,
    padding,
    yMin,
    yMax,
  }: Pick<Chart, 'height' | 'padding' | 'yMin' | 'yMax'>,
) {
  return padding.top + ((yMax - e) / (yMax - yMin)) * height;
}

function getChartPoints(
  { height, padding, width, yMin, yMax }: Chart,
  evolution: number[],
): Point[] {
  return evolution.map((e, i) => {
    const x =
      evolution.length === 1
        ? padding.left + width / 2
        : padding.left + (i / (evolution.length - 1)) * width;
    const y = getY(e, { height, padding, yMin, yMax });

    return { x, y };
  });
}

function getChart(yMin: number, yMax: number): Chart {
  const padding: Padding = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 60,
  };
  return {
    width: 800 - padding.left - padding.right,
    height: 300 - padding.top - padding.bottom,
    padding,
    yMin,
    yMax,
  };
}

function getYGap(range: number, targetTicks = 4): number {
  if (range <= 0) return 1;

  const roughGap = range / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(roughGap));
  const normalized = roughGap / magnitude;

  const value =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return value * magnitude;
}

function EloChart({ evolution }: { evolution: number[] }) {
  const [min, max] = [Math.min(...evolution), Math.max(...evolution)];
  const yGap = getYGap(max - min || 40);
  const yMin = Math.max(0, Math.floor(min / yGap) * yGap - yGap);
  const yMax = Math.ceil(max / yGap) * yGap + yGap;

  const ticks: number[] = [];

  for (let e = yMin; e <= yMax; e += yGap) ticks.push(e);

  const chart: Chart = getChart(yMin, yMax);

  const points = getChartPoints(chart, evolution);
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');
  const lastPoint = points.at(-1);

  return (
    <S.Chart viewBox="0 0 800 300">
      {ticks.map((t) => {
        const y = getY(t, chart);

        return (
          <g key={t}>
            <S.GridLine
              x1={chart.padding.left}
              x2={chart.padding.left + chart.width}
              y1={y}
              y2={y}
            />
            <S.AxisLabel
              x={chart.padding.left - 10}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {t}
            </S.AxisLabel>
          </g>
        );
      })}

      <S.EvolutionLine points={pointsString} />

      {lastPoint && <S.CurrentPoint cx={lastPoint.x} cy={lastPoint.y} r={5} />}
    </S.Chart>
  );
}

export default EloChart;

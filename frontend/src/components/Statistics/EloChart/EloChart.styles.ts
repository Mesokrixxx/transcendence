import styled from 'styled-components';

export const Chart = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
`;

export const GridLine = styled.line`
  stroke: var(--color-border);
  stroke-width: 1;
`;

export const AxisLabel = styled.text`
  fill: var(--color-text-secondary);
  font-size: 12px;
  font-family: inherit;
`;

export const EvolutionLine = styled.polyline`
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

export const CurrentPoint = styled.circle`
  fill: var(--color-accent);
  stroke: var(--color-background);
  stroke-width: 2;
`;

import styled from 'styled-components';

export const SegmentedBar = styled.div`
  display: flex;
  gap: 0.25rem;
  width: 100%;
  height: 0.65rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-surface);
`;

export const Segment = styled.div<{ $color: string; $value: number }>`
  flex-grow: ${(props) => props.$value};
  min-width: 0;
  background-color: ${(props) => props.$color};
  transition: flex-grow 200ms ease;
`;

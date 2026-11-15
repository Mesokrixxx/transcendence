import styled from 'styled-components';

export const SegmentedBar = styled.div`
  display: flex;
  width: 100%;
  height: 1rem;
  overflow: hidden;
  border-radius: 999px;
`;

export const Segment = styled.div<{ $color: string; $value: number }>`
  flex-grow: ${(props) => props.$value};
  background-color: ${(props) => props.$color};
`;

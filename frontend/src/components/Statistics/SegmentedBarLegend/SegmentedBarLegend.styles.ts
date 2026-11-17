import styled from 'styled-components';

export const Legend = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 100px), 1fr));
  gap: 1rem;
`;

export const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const Label = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Indicator = styled.span<{ $color: string }>`
  width: 0.5rem;
  height: 0.5rem;
  flex-shrink: 0;
  border-radius: 2px;
  background-color: ${(props) => props.$color};
`;

export const Percentage = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`;

export const Count = styled.div`
  font-size: 0.8rem;
  opacity: 0.65;
`;

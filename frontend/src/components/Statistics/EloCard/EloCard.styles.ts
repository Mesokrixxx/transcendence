import styled from 'styled-components';

export const EloCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
`;

export const EloTitle = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

export const EloValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

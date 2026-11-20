import styled from 'styled-components';

export const Statistics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

export const Stat = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
`;

export const StatTitle = styled.h2`
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 700;
`;

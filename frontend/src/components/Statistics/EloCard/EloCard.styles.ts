import styled from 'styled-components';

export const EloCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
`;

export const EloTitle = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
`;

export const EloValue = styled.div`
  color: var(--color-text-primary);
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

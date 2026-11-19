import styled from 'styled-components';

export const FavoriteOpponentsStats = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Opponent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--color-border);

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
`;

export const Rank = styled.div`
  width: 1.75rem;
  flex-shrink: 0;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
`;

export const Username = styled.div`
  overflow: hidden;
  color: var(--color-text-primary);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GamesPlayed = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.8rem;
`;

export const WinRate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  flex-shrink: 0;
`;

export const Percentage = styled.div`
  color: var(--color-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

export const WinRateLabel = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.8rem;
`;

export const InsufficientData = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

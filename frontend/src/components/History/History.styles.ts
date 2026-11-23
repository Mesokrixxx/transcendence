import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const History = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const GameEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  padding: 1rem 1.125rem;

  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;

  color: var(--color-text-primary);
`;

export const GameHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

export const GameResult = styled.span<{
  $result: 'win' | 'loss' | 'draw' | 'ongoing';
}>`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  color: ${({ $result }) => {
    switch ($result) {
      case 'win':
        return 'var(--color-accent)';
      case 'loss':
      case 'draw':
        return 'var(--color-text-secondary)';
      case 'ongoing':
        return 'var(--color-primary)';
    }
  }};
`;

export const GameDate = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

export const GameOpponent = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
`;

export const OpponentName = styled.span`
  min-width: 0;
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const OpponentElo = styled.span`
  flex-shrink: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
`;

export const GameFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
`;

export const GameColor = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

export const GameEndType = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
`;

export const GameArrow = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 2rem;
  height: 2rem;
  margin-left: auto;

  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: 0.375rem;

  transition:
    color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;

  &:hover {
    color: var(--color-primary);
    background: var(--color-border);
    transform: translateX(2px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

export const EmptyHistory = styled.p`
  margin: 0;
  padding: 2rem 1rem;

  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-align: center;

  background: var(--color-surface);
`;

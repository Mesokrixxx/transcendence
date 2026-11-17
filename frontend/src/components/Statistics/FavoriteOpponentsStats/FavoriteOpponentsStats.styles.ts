import styled from 'styled-components';

export const FavoriteOpponentsStats = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Opponent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
`;

export const Rank = styled.div`
  width: 2rem;
  flex-shrink: 0;
  opacity: 0.65;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
`;

export const Username = styled.div`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GamesPlayed = styled.div`
  font-size: 0.8rem;
  opacity: 0.65;
`;

export const WinRate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  flex-shrink: 0;
`;

export const Percentage = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
`;

export const WinRateLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.65;
`;

export const InsufficientData = styled.div`
  opacity: 0.65;
`;

import styled from 'styled-components';

export const GameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
`;

export const GameRow = styled.article`
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;

  h2 {
    font-size: 20px;
  }

  p {
    margin-top: 8px;
    color: var(--color-text-secondary);
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    text-align: center;
    padding: 16px;
  }
`;
export const MiniBoard = styled.div`
  width: 160px;

  > .chessboard {
    width: 100%;
    max-width: none;
    border-width: 2px;
    border-radius: 4px;
  }
`;

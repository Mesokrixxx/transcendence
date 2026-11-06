import styled from 'styled-components';

export const PlayContent = styled.main`
  flex: 1;
  display: grid;
  align-items: center;
  min-width: 0;
  box-sizing: border-box;
  margin-inline: auto;
  padding: 24px;

  && {
    width: 100%;
    max-width: 1600px;
  }

  @media (max-width: 480px) {
    padding: 24px 16px;
  }
`;

export const GameArea = styled.section`
  display: grid;
  grid-template-columns:
    minmax(0, 0.5fr)
    minmax(0, 2fr)
    minmax(0, 0.5fr);
  grid-template-areas: 'info board chat';
  align-items: start;
  gap: 24px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  // margin-top: 24px;

  > .chessboard {
    grid-area: board;
    justify-self: center;
  }

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'info'
      'board'
      'chat';
    justify-items: center;
    gap: 32px;
  }
`;

export const GameInfo = styled.aside`
  grid-area: info;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: anywhere;

  p {
    margin: 0;
    color: var(--color-text-primary);
  }

  > div[role='group'] {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }

  > div[role='group'] > p {
    width: 100%;
  }

  > p[role='alert'] {
    margin-top: 16px;
  }

  .opponent {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
    color: var(--color-text-primary);
    font-weight: 600;
  }

  align-self: stretch;
  position: relative;

  > [role='status'] {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    transform: translateY(-50%);
  }

  @media (max-width: 1100px) {
    > [role='status'] {
      position: static;
      transform: none;
    }
  }
`;
export const GameChat = styled.aside`
  grid-area: chat;
  align-self: end;
  width: 100%;
  min-width: 0;
  max-width: 440px;

  > section {
    width: 100%;
    min-width: 0;
  }
`;

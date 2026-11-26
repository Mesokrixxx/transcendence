import styled from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;

  > main {
    flex: 1;
  }

  > footer {
    flex-shrink: 0;
  }
`;

export const Content = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
  align-items: center;
  gap: 24px;

  width: 100%;
  max-width: 1600px;
  margin-inline: auto;
  padding-block: 24px;

  > .chessboard {
    justify-self: center;
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    align-content: center;
    gap: 32px;
  }

  @media (max-width: 480px) {
    padding: 24px 16px;
    gap: 24px;
  }
`;

export const Intro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  min-width: 0;
  container-type: inline-size;
  width: 100%;

  h1 {
    font-size: clamp(32px, 15cqi, 56px);
    font-weight: 800;
    line-height: 1.1;
    max-width: 100%;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
  }

  span {
    color: var(--color-primary);
  }

  @media (max-width: 900px) {
    align-items: center;
    text-align: center;

    h1 {
      text-align: center;
    }
  }
`;

export const Aside = styled.div`
  @media (max-width: 900px) {
    display: none;
  }
`;

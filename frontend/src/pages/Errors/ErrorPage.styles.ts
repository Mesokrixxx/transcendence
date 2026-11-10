import styled from 'styled-components';

export const ErrorContent = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-block: 56px;
`;

export const ErrorCard = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: 720px;
  text-align: center;

  .visually-hidden {
   position: absolute;
   width: 1px;
   height: 1px;
   padding: 0;
   margin: -1px;
   overflow: hidden;
   clip-path: inset(50%);
   white-space: nowrap;
   border: 0;
  }

  > p {
    max-width: 440px;
    margin: 0 auto;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
`;

export const ErrorIllustration = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;

  img {
    display: block;
    width: clamp(64px, 12vw, 88px);
    height: clamp(64px, 12vw, 88px);
    object-fit: contain;
  }

  .lost-knight {
  position: relative;
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  flex-shrink: 0;
  }

  .fallen {
    transform: rotate(-65deg);
  }
`;

export const ErrorCode = styled.div`
  color: var(--color-primary);
  font-size: clamp(64px, 12vw, 96px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;

  span {
    color: var(--color-text-primary);
  }
`;

export const ErrorActions = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 32px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const ErrorBoard = styled.div`
  width: clamp(88px, 20vw, 128px);
  flex-shrink: 0;
  margin: 16px 8px;
  pointer-events: none;

  && > .chessboard {
    position: relative;
    width: 100%;
    max-width: none;
    overflow: visible;
    transform: rotate(-25deg);
  }

  && > .chessboard > button {
    position: static;
  }

  && > .chessboard > button > img {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    width: 55%;
    height: 55%;
    max-width: none;
    object-fit: contain;
    transform: translate(-50%, -50%) rotate(55deg);
    filter: drop-shadow(0 6px 6px rgb(0 0 0 / 30%));
  }
`;
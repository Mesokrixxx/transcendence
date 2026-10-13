import styled from 'styled-components'

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

export const Content = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
  align-items: center;
  gap: 24px;

  width: 100%;
  max-width: 1500px;
  margin-inline: auto;
  padding-block: 24px;

  > .chessboard {
    justify-self: center;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    justify-self: center;
  }
`

export const Intro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  h1 {
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 800;
    line-height: 1.1;
  }

  span {
    color: var(--color-primary);
  }
  
  @media (max-width: 900px) {
    h1 {
        width: 100%;
        text-align: center;
    }
  }
`

export const Aside = styled.div`
  @media (max-width: 900px) {
    display: none;
  }
`
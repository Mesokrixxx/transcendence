import styled from 'styled-components'

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

export const Content = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 24px;
  padding-block: 24px;

  > .chessboard {
    justify-self: center;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

export const Intro = styled.div`
  h1 {
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 800;
    line-height: 1.1;
  }

  span {
    color: var(--color-primary);
  }
`

export const Aside = styled.div`
  @media (max-width: 900px) {
    display: none;
  }
`
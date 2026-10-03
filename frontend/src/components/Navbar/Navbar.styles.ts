import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Header = styled.header
`
    background: linear-gradient(
    135deg,
    var(--color-surface),
    var(--color-background));

    border-bottom: 1px solid var(--color-border);

    a{
        color: var(--color-text-primary);
        text-decoration:none;
        }
`

export const Content = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto 1fr;
  max-width: none;
  gap: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr auto;
  }
`

export const Brand = styled(Link)`
  font-size: 32px;
  font-weight: 800;
  display: flex;
  align-items: center;

  span {
    color: var(--color-primary);
  }
`

export const Icon = styled.img`
  width: 24px;
  height: 32px;
`

export const Navigation = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;

  @media (max-width: 1100px) {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: center;
  }
`

export const Auth = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  justify-self: end;
`
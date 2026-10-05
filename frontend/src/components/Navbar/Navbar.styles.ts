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

export const LanguageButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }
`

export const LanguageMenu = styled.div`
  position: relative;
`

export const LanguageOptions = styled.ul`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 10;

  min-width: 150px;
  padding: 8px;
  list-style: none;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;

  button {
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--color-text-primary);
    text-align: left;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background-color: var(--color-background);
    }
  }
`
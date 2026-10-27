import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Header = styled.header`
  background: linear-gradient(
    135deg,
    var(--color-surface),
    var(--color-background)
  );
  border-bottom: 1px solid var(--color-border);

  a {
    color: var(--color-text-primary);
    text-decoration: none;
  }
`

export const Content = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto 1fr;
  max-width: none;
  min-width: 0;
  box-sizing: border-box;
  gap: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr auto;
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
  }
`

export const Brand = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 32px;
  font-weight: 800;
  white-space: nowrap;

  span {
    color: var(--color-primary);
  }

  @media (max-width: 600px) {
    font-size: 26px;
  }
`

export const Icon = styled.img`
  width: 24px;
  height: 32px;
  flex-shrink: 0;
`

export const BurgerButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 26px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }

  @media (max-width: 600px) {
    display: inline-flex;
  }
`

export const MenuContent = styled.div<{ $open: boolean }>`
  display: contents;

  @media (max-width: 600px) {
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    grid-column: 1 / -1;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    padding: 16px 0;
    border-top: 1px solid var(--color-border);
  }
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

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    a {
      padding: 12px;
      border-radius: 8px;
    }

    a:hover {
      background: var(--color-surface);
    }
  }
`

export const Auth = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  justify-self: end;

  @media (max-width: 600px) {
    justify-content: center;
    gap: 12px;

    > a {
      padding: 10px 16px;
      font-size: 14px;
      white-space: nowrap;
    }
  }
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
  margin: 0;
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
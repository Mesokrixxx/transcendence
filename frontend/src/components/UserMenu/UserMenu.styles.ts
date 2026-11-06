import styled from 'styled-components'

export const AccountMenu = styled.div`
  position: relative;
  min-width: 0;
  max-width: 100%;
`

export const AccountButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  cursor: pointer;

  .username {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: var(--color-surface);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }
`

export const AccountOptions = styled.nav`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  width: 190px;
  max-width: calc(100vw - 32px);
  padding: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;

  a,
  button {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--color-text-primary);
    font: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }

  a:hover,
  button:hover {
    background: var(--color-background);
  }

  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`

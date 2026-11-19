import styled from 'styled-components';

export const FriendSelect = styled.select`
  width: 100%;
  min-height: 44px;
  margin: 8px 0 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  color: var(--color-text-primary);
  padding: 10px 12px;
  font: inherit;

  &:hover {
    border-color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  option {
    background: var(--color-background);
    color: var(--color-text-primary);
  }
`;

export const ConfirmationDialog = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin-top: 12px;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: 10px;
  background: var(--color-surface);
  padding: 16px;

  p {
    margin: 0 0 12px;
  }

  div {
    display: flex;
    gap: 8px;
  }

  button {
    min-height: 38px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-background);
    color: var(--color-text-primary);
    padding: 8px 14px;
    cursor: pointer;
    font: inherit;
    font-weight: 700;

    &:first-child {
      border-color: var(--color-accent);
      background: var(--color-accent);
      color: var(--color-background);
    }

    &:disabled {
      cursor: wait;
      opacity: 0.65;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
    }
  }
`;

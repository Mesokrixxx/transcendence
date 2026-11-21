import styled from 'styled-components';

export const NotificationLayer = styled.div`
  position: fixed;
  z-index: 1000;
  top: 16px;
  left: 16px;
  display: grid;
  gap: 12px;
  width: min(360px, calc(100vw - 32px));
`;

export const NotificationCard = styled.section`
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: 12px;
  background: var(--color-surface);
  box-shadow: 0 12px 32px rgb(20 19 27 / 45%);
  padding: 16px;
  color: var(--color-text-primary);
  animation: notification-in 180ms ease-out;

  p {
    margin: 0 0 12px;
    line-height: 1.45;
  }

  @keyframes notification-in {
    from {
      opacity: 0;
      transform: translateX(-12px);
    }
  }
`;

export const PrivateMessageNotificationCard = styled(NotificationCard)`
  animation:
    notification-in 180ms ease-out,
    notification-fade 300ms ease-in 2700ms forwards;

  @keyframes notification-fade {
    to {
      opacity: 0;
      transform: translateX(-12px);
    }
  }
`;

export const NotificationActions = styled.div`
  display: flex;
  gap: 8px;

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

    &:hover {
      border-color: var(--color-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
    }
  }
`;

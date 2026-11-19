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
  border: 1px solid var(--color-border, #4a4a4a);
  border-radius: 12px;
  background: var(--color-bg-secondary, #fff);
  box-shadow: 0 8px 24px rgb(0 0 0 / 24%);
  padding: 16px;
  color: var(--color-text-primary);

  p {
    margin: 0 0 12px;
  }
`;

export const NotificationActions = styled.div`
  display: flex;
  gap: 8px;

  button {
    cursor: pointer;
  }
`;

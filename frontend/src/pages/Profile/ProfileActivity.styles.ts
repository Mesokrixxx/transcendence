import styled from 'styled-components';

export const ActivityPanel = styled.section`
  min-width: 0;
  margin-bottom: 48px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
`;

export const ActivityTabs = styled.div`
  display: flex;
  gap: 24px;
  padding: 0 32px;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 600px) {
    gap: 16px;
    padding: 0 20px;
  }
`;

export const ActivityTab = styled.button`
  min-width: 0;
  padding: 20px 0;
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &[aria-selected='true'] {
    border-bottom-color: var(--color-primary);
    color: var(--color-primary);
  }

  &:hover {
    color: var(--color-text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -4px;
    border-radius: 4px;
  }
`;

export const ActivityContent = styled.div`
  padding: 32px;
  overflow-wrap: anywhere;

  p {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -4px;
    border-radius: 12px;
  }

  @media (max-width: 600px) {
    padding: 24px 20px;
  }
`;
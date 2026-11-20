import styled from 'styled-components';

export const Content = styled.main`
  flex: 1;
  min-width: 0;
  padding-block: 32px;

  h1 {
    margin: 0 0 24px;
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 800;
    color: var(--color-text-primary);
  }
`;

export const ChatLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
  height: clamp(400px, 65dvh, 640px);
  min-width: 0;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    height: clamp(520px, 75dvh, 740px);
  }
`;

export const ConversationList = styled.aside`
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 16px;
  border-right: 1px solid var(--color-border);

  h2 {
    margin: 0 0 20px;
    font-size: 20px;
    color: var(--color-text-primary);
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (max-width: 700px) {
    max-height: 180px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
`;

export const ConversationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &[aria-pressed='true'] {
    background: var(--color-background);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &:hover {
    background: var(--color-background);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -3px;
  }
`;

export const ConversationPanel = styled.div`
  min-width: 0;
  min-height: 0;

  &[hidden] {
    display: none;
  }

  > section {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0;
  }
`;
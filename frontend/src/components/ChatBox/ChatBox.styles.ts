import styled from 'styled-components';

export const Box = styled.section`
  display: flex;
  flex-direction: column;
  height: 400px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
`;

export const Title = styled.h2`
  padding: 12px 16px;
  font-size: 18px;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-border);
`;

export const MessageList = styled.ul`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  list-style: none;
`;

export const MessageItem = styled.li`
  p {
    margin-top: 2px;
    overflow-wrap: anywhere;
  }
`;

export const Author = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
`;

export const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  padding: 12px;
  border-top: 1px solid var(--color-border);
`;

export const Input = styled.input`
  flex: 1 1 150px;
  min-width: 0;
  padding: 10px 12px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
`;

export const SendButton = styled.button`
  flex: 1 0 auto;
  padding: 10px 16px;
  background-color: var(--color-primary);
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Placeholder = styled.p`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 12px 16px;
  text-align: center;
  color: var(--color-text-secondary)
`

export const Notice = styled.p<{ $isError?: boolean }>`
  margin: 0;
  padding: 4px 12px;
  font-size: 13px;
  color: ${({ $isError }) =>
    $isError ? 'var(--color-error, #f87171)' : 'var(--color-text-secondary)'};
`
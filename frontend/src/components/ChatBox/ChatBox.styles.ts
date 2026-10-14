import styled from 'styled-components'


export const Box = styled.section`
  display: flex;
  flex-direction: column;
  height: 400px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
`

export const Title = styled.h2`
  padding: 12px 16px;
  font-size: 18px;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-border);
`

export const MessageList = styled.ul`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  list-style: none;
`

export const MessageItem = styled.li`
  p {
    margin-top: 2px;
  }
`

export const Author = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
`

export const Form = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--color-border);
`

export const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
`

export const SendButton = styled.button`
  padding: 10px 16px;
  background-color: var(--color-primary);
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
`
import styled from 'styled-components';

export const OAuthOptions = styled.div`
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
  min-width: 0;
`;

export const Separator = styled.p`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }
`;
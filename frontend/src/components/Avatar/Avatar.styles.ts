import styled from 'styled-components';

export const AvatarWrapper = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
    font-size: ${({ $size }) => Math.max(24, $size * 0.45)}px;
  flex-shrink: 0;
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
`;

export const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-background);
  font-size: inherit;
  font-weight: 600;
`;

export const StatusDot = styled.span<{ $isOnline: boolean }>`
  position: absolute;
  top: 85%;
  left: 85%;
  transform: translate(-50%, -50%);

  box-sizing: border-box;
  width: max(11px,22%);
  height: max(11px,22%);
  border-radius: 50%;
  border: 2px solid var(--color-surface);
  background: ${({ $isOnline }) => ($isOnline ? 'var(--color-accent)' : 'var(--color-text-secondary)')};
`;

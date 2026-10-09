import styled from 'styled-components'

export const AvatarWrapper = styled.div<{ $size: number}>`
    position: relative;
    width: ${({ $size })=> $size}px;
    height: ${({ $size })=> $size}px;
    flex-shrink: 0;
`

export const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    border-raius: 50%;
    object-fit: cover;
    display: block;
`

export const AvatarFallback = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    background: var(--color-primary);
    color: var(--color-background);
    font-size: 1.5rem;
    font-weight: 600; 
`

export const StatusDot = styled.span<{ $isOnline: boolean }>`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    boder: 2px solid var(--color-surface);
    background: ${({ $isOnline })=>$isOnline ? 'var(--color-accent': 'var(--color-text-secondary'};

`
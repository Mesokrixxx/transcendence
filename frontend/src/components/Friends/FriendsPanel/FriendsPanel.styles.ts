import styled, { css } from 'styled-components';

export const Panel = styled.aside<{ $embedded?: boolean }>`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    width: 400px;
    max-width: 100%;
    overflow-y: auto;
    padding: 20px 16px;
    background-color: var(--color-background);
    border-left: 1px solid var(--color-border);
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.35);

    ${({ $embedded }) =>
        $embedded &&
        css`
            position: static;
            inset: auto;
            z-index: auto;
            width: auto;
            min-width: 0;
            overflow: visible;
            padding: 0;
            background: transparent;
            border: none;
            box-shadow: none;
        `}
`;

export const PanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
`

export const CloseButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;

    &:hover {
        color: var(--color-text-primary);
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    svg {
        width: 20px;
        height: 20px;
    }
`

export const Message = styled.p`
    padding: 24px;
    text-align: center;
    color: var(--color-text-secondary);
`

export const ActionButton = styled.button`
    padding: 4px 10px;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text-primary);
    font-size: 13px;
    cursor: pointer;

    &:hover:not(:disabled) {
        border-color: var(--color-primary);
        color: var(--color-primary);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
`
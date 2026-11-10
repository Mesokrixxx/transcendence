import styled from "styled-components"

export const Form = styled.form`
    margin-bottom: 24px;
`

export const Fields = styled.div`
    display: flex;
    gap: 8px;
`

export const Input = styled.input`
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-text-primary);

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
`

export const SubmitButton = styled.button`
    padding: 10px 16px;
    background-color: var(--color-primary);
    border: none;
    border-radius: 8px;
    color: var(--color-background);
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`

export const Feedback = styled.p<{ $isError?: boolean }>`
    margin: 8px 0 0;
    font-size: 13px;
    color: ${({ $isError }) =>
        $isError ? 'var(--color-error, #f87171)' : 'var(--color-accent)'};
`

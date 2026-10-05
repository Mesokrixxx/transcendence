import styled from 'styled-components'

export const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

export const Label = styled.label`
    color: var(--color-text-primary);
    font-size: 14px;
    font-weight: 500;
`

export const StyledInput = styled.input`
    width: 100%;
    padding 12px 16px;

    background-color: var(--color-background);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: 10px;

    &::placeholder{
        color: var(--color-text-secondary);    
    }
`
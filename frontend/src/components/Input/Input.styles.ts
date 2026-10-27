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

export const InputWrapper = styled.div`
    position: relative;
`

export const StyledInput = styled.input`
    width: 100%;
    padding: 12px 52px 12px 16px;

    background-color: var(--color-background);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: 10px;

    &::placeholder {
        color: var(--color-text-secondary);    
    }
    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    
    }
`

export const PasswordToggle = styled.button`
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);

    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    img{
        width: 20px;
        height: 20px;
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
    }
    
    &:disabled {
        cursor: default;
        opacity: 0.5;
    }

`
import styled from 'styled-components'

export const AuthContent = styled.main`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
`

export const AuthPanel = styled.div`
    width: 100%;
    max-width: 440px;
    padding 32px;

    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;

    h1{
        margin-bottom: 24px;
        color: var(--colorr-primary)
        font-size: 32px;
        text-align: center;
    }
`

export const AuthHint = styled.p`
    margin-top: 24px;
    color: var(--color-text-secondary)
    font-size: 14px;
    text-align: center;

`
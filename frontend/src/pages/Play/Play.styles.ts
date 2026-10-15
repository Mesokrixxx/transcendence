import styled from 'styled-components'

export const PlayContent = styled.main`
    flex: 1;
    padding-top: 32px;
    padding-bottom: 32px;
`

export const GameArea = styled.section`
    width: 100%;
    max-width: 640px;
    margin: 24px auto 0;

    > p {
        margin-bottom: 16px;
        color: var(--color-text-primary);
    }
`
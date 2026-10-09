import styled from 'styled-components'

export const ProfilePanel = styled.section`
    margin: 48px 0;
    padding: 32px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
`

export const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;

    h1 {
        margin: 0;
        color: var(--color-text-primary);
    }

    p {
        margin: 8px 0 0;
        color: var(--color-text-secondary);
    }
`
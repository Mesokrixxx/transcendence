import styled from 'styled-components'

export const Requirements = styled.ul`
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
`

export const Requirement = styled.li<{ $valid: boolean }>`
    color: ${({ $valid }) => {
        if ($valid) {
            return 'var(--color-accent'
        }
        return 'var(--color-text-secondary'
    }};
    `

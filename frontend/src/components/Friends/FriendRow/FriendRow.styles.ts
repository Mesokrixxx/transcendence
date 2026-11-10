import styled from "styled-components"

export const Row = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
        border-bottom: none;
    }
`

export const Name = styled.span`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

export const Actions = styled.div`
    display: flex;
    gap: 8px;
    margin-left: auto;
    flex-shrink: 0;
`
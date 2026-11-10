import styled from "styled-components"

export const Section = styled.section`
    margin-bottom: 24px;
`

export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px 8px;
`

export const Title = styled.h3`
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text-primary);
`

export const Count = styled.span`
    font-size: 13px;
    color: var(--color-text-secondary);
`

export const List = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 10px;
`

export const EmptyMessage = styled.p`
    margin: 0;
    padding: 16px 12px;
    text-align: center;
    font-size: 14px;
    color: var(--color-text-secondary);
    border: 1px dashed var(--color-border);
    border-radius: 10px;
`

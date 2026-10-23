import styled from 'styled-components'

export const Content = styled.main`
  flex: 1;
  padding-block: 24px;

`

export const Header = styled.header`
  margin-bottom : 32px;

  h1 {
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 12px;
  }

  span {
    color: var(--color-primary);
  }
  
  p {
    color: var(--color-text-secondary);
  }

`

export const Eyebrow = styled.span`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-primary);

  &::after {
    content: '';
    width: 40px;
    height: 2px;
    background-color: var(--color-primary);
  }
`

export const TableWrapper = styled.div`
  overflow-x: auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  th {
    color: var(--color-primary);
  }

  tbody tr:hover {
    background-color: var(--color-background);
  }

  tbody tr:first-child {
    background-color: color-mix(in srgb, var(--color-primary) 18%, transparent);
    font-weight: 700;
  }
`

export const PlayerCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const WinRate = styled.td`
  color: var(--color-primary);
  font-weight: 700;
`

export const RankCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const MedalSlot = styled.span`
  width: 24px;
  height: 24px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%
    display: block;
  }
`
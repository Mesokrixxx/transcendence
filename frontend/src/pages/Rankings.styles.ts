import styled from 'styled-components'

export const Content = styled.main`
  flex: 1;
  padding-block: 24px;

  h1 {
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 800;
    margin-bottom: 24px;
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
`
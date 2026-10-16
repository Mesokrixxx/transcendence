import styled from 'styled-components'
import { Board } from '../ChessBoard/ChessBoard.styles'

export const GameLayout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 0.5fr) minmax(0, 2fr) minmax(0, 0.5fr);
    align-items: center;
    gap: 24px;
    width: 100%;

    > aside {
        grid-column: 1;
        grid-row: 1;
    }
    
    > div {
        grid-column: 2;
        grid-row: 1;
    }

    @media (max-width: 900px){
        grid-template-columns: minmax(0, 1fr);
        justify-items: center;
        gap:32px;

        > aside {
            grid-column: 1;
            grid-row: 1; 
        }

        > div {
            grid-column: 1;
            grid-row: 2; 
        }
    }
`
export const PlayBoard = styled(Board)`
    justify-self: center;
`
export const GameInfo = styled.aside`
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow-wrap: anywhere;

    p{
        margin: 0;
        color: var(--color-text-primary);
    }

    > div {
     display: flex;
     flex-wrap: wrap;
     gap: 12px;
     margin-top: 24px;
    }

    > div > p {
     width: 100%
    }

    > p[role='alert']{
        margin-top: 16px;    
    }
`
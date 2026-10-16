import styled from 'styled-components'
import { Board } from '../ChessBoard/ChessBoard.styles'

export const GameLayout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 0.5fr) minmax(0, 2fr) minmax(0, 0.5fr);
    align-items: start;
    gap: 24px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;

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
    overflow-wrap: anywhere;

    p{
        margin: 0;
        color: var(--color-text-primary);
    }

    > div[role='group']{
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

    .opponent {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin: 0 0 24px;
        color: var(--color-text-primary);
        font-weight: 600;
    }

    .game-status {
        padding: 16px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;

    }
`
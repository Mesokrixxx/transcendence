import styled from 'styled-components'

export const Board = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(8, 1fr);
    width: 100%;
    max-width: 500px;
    aspect-ratio: 1;;
    border 4px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden; 
`

export const Square = styled.div<{ $isLight: boolean }>`
    display: flex;
    align-iems: center;
    justify-content: center;
    min-width: 0;
    min-height: 0;

    background-color: ${({ $isLight }) => {
        if($isLight) {
            return 'var(--color-board-light)'
        }
        return 'var(--color-board-dark)'
    }};
`

export const Piece = styled.img`
width: 85%;
height 85%;
object-fit: contain;

`
import styled from 'styled-components'

export const TrainingContent = styled.main`
    flex: 1;
    display: grid;
    align-items: center;
    min-width: 0;
    box-sizing: border-box;
    margin-inline: auto;
    padding: 24px;

    && {
        width: 100%;
        max-width: 1600px;
    }

    @media (max-width: 480px) {
        padding: 24px 16px;
    }
`

export const GameArea = styled.section`
    display: grid;
    grid-template-columns:
        minmax(0, 0.5fr)
        minmax(0, 2fr)
        minmax(0, 0.5fr);
    grid-template-areas: 'info board';
    align-items: start;
    gap: 24px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;

    > .chessboard {
        grid-area: board;
        justify-self: center;
    }

    @media (max-width: 1100px) {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
            'info'
            'board'
            'chat';
        justify-items: center;
        gap: 32px;
    }
`

export const GameInfo = styled.aside`
    grid-area: info;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    overflow-wrap: anywhere;

    h1 {
        margin: 0;
        color: var(--color-primary);
    }

    p {
        margin: 0;
        color: var(--color-text-primary);
    }

    > div[role='group'] {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    > div[role='group'] > p {
        width: 100%;
    }
`
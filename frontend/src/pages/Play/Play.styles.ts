import styled from 'styled-components'

export const PlayContent = styled.main`
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    margin-inline: auto;
    padding-block: 24px;

    && {
        width: 100%;
        max-width: 1600px;    
    }

    @media (max-width: 480px){
        padding: 24px 16px;
    }
`

export const GameArea = styled.section`
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    margin-top: 24px;

    }
`
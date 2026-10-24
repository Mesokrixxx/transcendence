import { useState } from 'react'
import ChessGame from '../../../../chessgame/src/chessgame'
import type { Move } from '../../../../chessgame/src/chessgame.types'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import ChessBoard from '../../components/ChessBoard/ChessBoard'
import Avatar from '../../components/Avatar/Avatar'
import GameStatus from '../../components/GameStatus/GameStatus'
import ChatBox from '../../components/ChatBox/ChatBox'
import Button from '../../components/Button/Button'
import { Page } from '../Home/Home.styles'
import { PlayContent as WatchContent, GameArea, GameInfo, GameChat } from '../Play/Play.styles'

// en attendant les donnees du back
const demoMoves: Move[] = [
    // { from: 'e2', to: 'e4'},
    // { from: 'e7', to: 'e5'},
    // { from: 'g1', to: 'f3'},
    // { from: 'b8', to: 'c6'},
]

function Watch() {
    const [game]= useState(()=> new ChessGame(demoMoves))
    const [orientation, setOrientation] = useState<'white' | 'black'>('white')

    function flipBoard(){
        if(orientation === 'white')
        {
            setOrientation('black')
        }
        else{
            setOrientation('white')
        }
    }

    return (
        <Page>
            <Navbar />

            <WatchContent className="container">
                <GameArea aria-label="Demo game for spectators">
                    <GameInfo aria-label="Game information">
                        <div className="opponent">
                            <Avatar username="Player White" size={48} />
                            <span>Player White — White</span>
                        </div>

                        <div className="opponent">
                            <Avatar username="Player Black" size={48} />
                            <span>Player Black — Black</span>
                        </div>

                        <p>Demo game</p>

                        <Button
                            variant="secondary"
                            onClick={flipBoard}
                        >
                            Flip board
                        </Button>

                        <GameStatus game={game} />
                    </GameInfo>

                    <ChessBoard
                        board={game.getBoard()}
                        orientation={orientation}
                        readOnly
                    />

                    <GameChat aria-label="Spectator chat">
                        <ChatBox title="Spectator chat" />
                    </GameChat>
                </GameArea>
            </WatchContent>

            <Footer />
        </Page>
    )
} 
export default Watch


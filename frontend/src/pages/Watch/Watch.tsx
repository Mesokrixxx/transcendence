import { useState } from 'react'
import ChessGame from '../../../../chessgame/src/chessgame'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { Page } from '../Home/Home.styles'
import ChessBoard from '../../components/ChessBoard/ChessBoard'
import Button from '../../components/Button/Button'
import { GameList, GameRow, MiniBoard } from './Watch.styles'


function Watch() {
    const [game] = useState(()=> new ChessGame())
    return (
        <Page>
            <Navbar />
            <main className="container">
                <h1>Game in progress</h1>
                
                <GameList>
                    <GameRow>
                        <MiniBoard>
                            <ChessBoard  board={game.getBoard()}readOnly/>
                        </MiniBoard>

                        <div>
                            <h2>Player White VS Player Black</h2>
                            <p>Demo game</p>
                        </div>

                        <Button to="/watch/1">Watch game</Button>
                    </GameRow>
                </GameList>
            </main>
            <Footer />
        </Page>
    )
}
export default Watch
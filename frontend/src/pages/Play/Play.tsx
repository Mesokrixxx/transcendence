import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import PlayableChessBoard from '../../components/PlayableChessBoard/PlayableChessBoard'
import { Page } from '../Home/Home.styles'
import { PlayContent, GameArea } from './Play.styles'

function Play(){
    return( 
        <Page>
            <Navbar/>

            <PlayContent className="container">
                <GameArea aria-label="Local chess game">
                    <PlayableChessBoard />
                </GameArea>
            </PlayContent>

            <Footer/>
        </Page>
        )
}
export default Play
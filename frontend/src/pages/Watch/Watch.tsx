import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { Page } from '../Home/Home.styles'

function Watch() {
    return (
        <Page>
            <Navbar />
            <main className="container">
                <h1>Game in progress</h1>
                <p>No games to display yet.</p>
            </main>
            <Footer />
        </Page>
    )
}
export default Watch
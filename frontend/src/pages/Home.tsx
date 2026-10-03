import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import ChessBoard from '../components/ChessBoard/ChessBoard'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <Navbar />

      <main className="container home__content">
        <div className="home__intro">
          <h1>Make your <span>move!</span></h1>
        </div>

        <ChessBoard />

        <div className="home__aside" />
      </main>

      <Footer />
    </div>
  )
}

export default Home
import Footer from '../components/Footer/Footer'
import Navbar from '../components/Navbar/Navbar'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <Navbar/>
        <main className="container home__content">
            <h1>Chess <span>Move</span></h1>
            <p>Make your move.</p>

            <div className="home__actions">
            <button>Create account</button>
            <button>Log in</button>
            <button>Play as guest</button>
            </div>
        </main>

      <Footer />
    </div>
  )
}

export default Home
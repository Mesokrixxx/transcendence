import Footer from '../components/Footer/Footer'
function Home(){
    return (
        <main className="container">
            <h1>Chess Move</h1>
            <p>Make your move.</p>

            <div>
                <button> Create account</button>
                <button> Log in </button>
                <button> Play as guest </button>
            </div>

            <Footer />
        </main>
    )
}

export default Home
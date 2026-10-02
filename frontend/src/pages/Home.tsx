import Footer from '../components/Footer'
function Home(){
    return (
        <main>
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
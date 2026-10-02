import { Link } from 'react-router-dom'
import'./Navbar.css'

function Navbar()
{
    return(
        <header className="navbar">
            <div className="container navbar__content">
                <Link to="/" className="navbar__brand">
                    <span className="navbar__icon" aria-hidden="true"><img src="/icons/rook-solid-full.svg" alt="navbar__icon" className="navbar__icon"/></span>
                    Chess<span>Move</span>
                </Link>
                <nav className="navbar__links" aria-label="Main navigation">
                    <Link to="/play">Play</Link>
                    <Link to="/watch">Watch</Link>
                    <Link to="/tournaments">Tournaments</Link>
                </nav>

                <div className="navbar__auth">
                    <Link to="/login">Log in </Link>
                    <Link to="/register" className="navbar__signup">Sign Up </Link>
                </div>
            </div>
        </header>
    )
}

export default Navbar
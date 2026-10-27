import { Link } from 'react-router-dom'
import { Links } from './Footer.styles'

function Footer()
{   const year =new Date().getFullYear()
    return(
        <footer>
            <Links className="container">
                <span>© {year} Chessmove</span>
                <span aria-hidden="true">|</span>
                <Link to="/privacy">Privacy Policy</Link>
                <span aria-hidden="true">|</span>
                <Link to="/terms">Terms of Service</Link>
            </Links>
        </footer>
    )
}

export default Footer
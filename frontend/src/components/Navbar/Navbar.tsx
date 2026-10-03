import { Link } from 'react-router-dom'
import {
  Header,
  Content,
  Brand,
  Icon,
  Navigation,
  Auth,
} from './Navbar.styles'

function Navbar() {
  return (
    <Header>
      <Content className="container">
        <Brand to="/">
          <Icon src="/icons/rook-solid-full.svg" alt="" />
          Chess<span>Move</span>
        </Brand>

        <Navigation aria-label="Main navigation">
          <Link to="/play">Play</Link>
          <Link to="/watch">Watch</Link>
          <Link to="/tournaments">Tournaments</Link>
          <Link to="/tournaments">Rankings</Link>
        </Navigation>

        <Auth>
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign Up</Link>
        </Auth>
      </Content>
    </Header>
  )
}

export default Navbar
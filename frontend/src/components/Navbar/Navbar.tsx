import { Link } from 'react-router-dom'
import Button from '../Button/Button'
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
          <Button to="/login" variant="secondary">Log in</Button>
          <Button to="/register" variant="primary">Sign Up</Button>
        </Auth>
      </Content>
    </Header>
  )
}

export default Navbar
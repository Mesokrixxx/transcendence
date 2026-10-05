import { Link } from 'react-router-dom'
import { useState } from 'react'
import Button from '../Button/Button'
import {
  Header,
  Content,
  Brand,
  Icon,
  Navigation,
  Auth,
  LanguageButton,
  LanguageMenu,
  LanguageOptions
} from './Navbar.styles'

function Navbar() {
  const [showLanguages, setShowLanguages] = useState(false)
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

          <LanguageMenu>
            <LanguageButton 
            type="button" 
            arial-label="Change language" 
            aria-expanded={showLanguages}
            aria-controls="language-options"
            onClick={() => setShowLanguages(!showLanguages)}>
              <img src="/icons/language-icon.svg" alt=""></img>
            </LanguageButton>

            {showLanguages && (
              <LanguageOptions id="language-otptions">
                <li><button type="button" lang="fr">Français</button></li>
                <li><button type="button" lang="es">Español</button></li>
                <li><button type="button" lang="en">English</button></li>
              </LanguageOptions>
            )}
          </LanguageMenu>

        </Auth>
      </Content>
    </Header>
  )
}

export default Navbar
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import fetchAPI from '../../services/fetchAPI'
import Button from '../Button/Button'
import UserMenu from '../UserMenu/UserMenu'
import {
  Header,
  Content,
  Brand,
  Icon,
  BurgerButton,
  MenuContent,
  Navigation,
  Auth,
  LanguageButton,
  LanguageMenu,
  LanguageOptions
} from './Navbar.styles'

function Navbar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)

  const headerRef = useRef<HTMLElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  const menuId = useId()
  const languageId = useId()

  function closeMenus() {
    setShowMenu(false)
    setShowLanguages(false)
  }

  useEffect(() => {
    if (!showMenu && !showLanguages) {
      return
    }

    function handleClickOutside(event: PointerEvent) {
      if (!(event.target instanceof Node)) {
        return
      }

      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setShowMenu(false)
        setShowLanguages(false)
      } else if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setShowLanguages(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      if (showLanguages) {
        setShowLanguages(false)

        const button =
          languageMenuRef.current?.querySelector('button')

        button?.focus()
      } else {
        setShowMenu(false)
        burgerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMenu, showLanguages])

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    setLogoutError('')

    try {
      const response = await fetchAPI<void>({
        path: '/auth/logout',
        method: 'post'
      })

      if (response.error === true) {
        if (typeof response.result === 'string') {
          setLogoutError(response.result)
        } else {
          setLogoutError(response.result.error)
        }

        return
      }

      setUser(null)
      closeMenus()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Header ref={headerRef}>
      <Content className="container">
        <Brand to="/" onClick={closeMenus}>
          <Icon src="/icons/rook-solid-full.svg" alt="" />
          Chess<span>Move</span>
        </Brand>

        <BurgerButton
          ref={burgerRef}
          type="button"
          aria-label={showMenu ? 'Close navigation' : 'Open navigation'}
          aria-expanded={showMenu}
          aria-controls={menuId}
          onClick={() => {
            setShowMenu((open) => !open)
            setShowLanguages(false)
          }}
        >
          <span aria-hidden="true">
            {showMenu ? '✕' : '☰'}
          </span>
        </BurgerButton>

        <MenuContent
          id={menuId}
          $open={showMenu}
          onClick={(event) => {
            if (
              event.target instanceof Element &&
              event.target.closest('a')
            ) {
              closeMenus()
            }
          }}
        >
          <Navigation aria-label="Main navigation">
            <NavLink to="/play">Play</NavLink>
            <NavLink to="/training">Training</NavLink>
            <NavLink to="/watch">Watch</NavLink>
            <NavLink to="/rankings">Rankings</NavLink>
          </Navigation>

          <Auth>
            {user ? (
              <UserMenu
                username={user.username}
                isLoggingOut={isLoggingOut}
                onLogout={handleLogout}
              />
            ) : (
              <>
                <Button to="/login" variant="secondary">
                  Log in
                </Button>

                <Button to="/register" variant="primary">
                  Sign Up
                </Button>
              </>
            )}

            {logoutError && (
              <p role="alert">{logoutError}</p>
            )}

            <LanguageMenu ref={languageMenuRef}>
              <LanguageButton
                type="button"
                aria-label="Change language"
                aria-expanded={showLanguages}
                aria-controls={languageId}
                onClick={() => setShowLanguages((open) => !open)}
              >
                <img src="/icons/language-icon.svg" alt="" />
              </LanguageButton>

              {showLanguages && (
                <LanguageOptions id={languageId}>
                  <li>
                    <button
                      type="button"
                      lang="fr"
                      onClick={closeMenus}
                    >
                      Français
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      lang="es"
                      onClick={closeMenus}
                    >
                      Español
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      lang="en"
                      onClick={closeMenus}
                    >
                      English
                    </button>
                  </li>
                </LanguageOptions>
              )}
            </LanguageMenu>
          </Auth>
        </MenuContent>
      </Content>
    </Header>
  )
}

export default Navbar
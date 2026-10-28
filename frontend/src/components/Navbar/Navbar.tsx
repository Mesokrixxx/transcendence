import { Link } from 'react-router-dom';
import { useEffect, useId, useRef, useState } from 'react';
import Button from '../Button/Button';
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
  LanguageOptions,
} from './Navbar.styles';

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const menuId = useId();
  const languageId = useId();

  function closeMenus() {
    setShowMenu(false);
    setShowLanguages(false);
  }

  useEffect(() => {
    if (!showMenu && !showLanguages) return;

    function handleClickOutside(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;

      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowLanguages(false);
      } else if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setShowLanguages(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      if (showLanguages) {
        setShowLanguages(false);

        if (languageMenuRef.current) {
          const button = languageMenuRef.current.querySelector('button');

          if (button) {
            button.focus();
          }
        }
      } else {
        setShowMenu(false);
        burgerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMenu, showLanguages]);

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
            setShowMenu((open) => !open);
            setShowLanguages(false);
          }}
        >
          <span aria-hidden="true">{showMenu ? '✕' : '☰'}</span>
        </BurgerButton>

        <MenuContent
          id={menuId}
          $open={showMenu}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest('a')) {
              closeMenus();
            }
          }}
        >
          <Navigation aria-label="Main navigation">
            <Link to="/play">Play</Link>
            <Link to="/watch">Watch</Link>
            {/* <Link to="/tournaments">Tournaments</Link> */}
            <Link to="/rankings">Rankings</Link>
          </Navigation>

          <Auth>
            <Button to="/login" variant="secondary">
              Log in
            </Button>

            <Button to="/register" variant="primary">
              Sign Up
            </Button>

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
                    <button type="button" lang="fr" onClick={closeMenus}>
                      Français
                    </button>
                  </li>
                  <li>
                    <button type="button" lang="es" onClick={closeMenus}>
                      Español
                    </button>
                  </li>
                  <li>
                    <button type="button" lang="en" onClick={closeMenus}>
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
  );
}

export default Navbar;

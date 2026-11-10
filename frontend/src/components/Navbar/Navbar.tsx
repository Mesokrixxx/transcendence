import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import fetchAPI from '../../services/fetchAPI';
import i18n from '../../services/i18n';
import Button from '../Button/Button';
import UserMenu from '../UserMenu/UserMenu';
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
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const menuId = useId();
  const languageId = useId();

  const githubClientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
  const githubRedirectURI = import.meta.env.VITE_OAUTH_REDIRECT_URI;
  const githubSignInEnabled =
    typeof githubClientId === 'string' &&
    typeof githubRedirectURI === 'string' &&
    githubClientId.length > 0 &&
    githubRedirectURI.length > 0;

  function closeMenus() {
    setShowMenu(false);
    setShowLanguages(false);
  }

  function changeLanguage(language: string) {
    void i18n.changeLanguage(language);
    closeMenus();
  }

  useEffect(() => {
    if (!showMenu && !showLanguages) return;

    function handleClickOutside(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;

      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
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
        languageMenuRef.current?.querySelector('button')?.focus();
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

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const response = await fetchAPI<void>({
        path: '/auth/logout',
        method: 'post',
      });

      if (response.error === true) {
        if (typeof response.result === 'string') {
          setLogoutError(response.result);
        } else {
          setLogoutError(response.result.error);
        }

        return;
      }

      setUser(null);
      closeMenus();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Header ref={headerRef}>
      <Content className="container">
        <Brand to="/" onClick={closeMenus}>
          <Icon src="/icons/rook-solid-full.svg" alt="" />
          <Trans ns="home" i18nKey="chessMoveBrand">
            Chess<span>Move</span>
          </Trans>
        </Brand>

        <BurgerButton
          ref={burgerRef}
          type="button"
          aria-label={
            showMenu
              ? t('closeNavigation', { ns: 'common' })
              : t('openNavigation', { ns: 'common' })
          }
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
            if (
              event.target instanceof Element &&
              event.target.closest('a')
            ) {
              closeMenus();
            }
          }}
        >
          <Navigation
            aria-label={t('mainNavigation', { ns: 'common' })}
          >
            <NavLink to="/play">
              {t('play', { ns: 'navigation' })}
            </NavLink>

            <NavLink to="/training">
              {t('training', { ns: 'navigation' })}
            </NavLink>

            <NavLink to="/watch">
              {t('watch', { ns: 'navigation' })}
            </NavLink>

            <NavLink to="/rankings">
              {t('rankings', { ns: 'navigation' })}
            </NavLink>
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
                  {t('logIn', { ns: 'auth' })}
                </Button>

                <Button to="/register" variant="primary">
                  {t('signUp', { ns: 'auth' })}
                </Button>

                {githubSignInEnabled && (
                  <Button to="/github-signin" variant="primary">
                    {t('ghSignIn', { ns: 'auth' })}
                  </Button>
                )}
              </>
            )}

            {logoutError && <p role="alert">{logoutError}</p>}

            <LanguageMenu ref={languageMenuRef}>
              <LanguageButton
                type="button"
                aria-label={t('changeLanguage', { ns: 'common' })}
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
                      aria-current={
                        i18n.language === 'fr' ? 'true' : undefined
                      }
                      onClick={() => changeLanguage('fr')}
                    >
                      {t('french', { ns: 'navigation' })}
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      lang="es"
                      aria-current={
                        i18n.language === 'es' ? 'true' : undefined
                      }
                      onClick={() => changeLanguage('es')}
                    >
                      {t('spanish', { ns: 'navigation' })}
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      lang="en"
                      aria-current={
                        i18n.language === 'en' ? 'true' : undefined
                      }
                      onClick={() => changeLanguage('en')}
                    >
                      {t('english', { ns: 'navigation' })}
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

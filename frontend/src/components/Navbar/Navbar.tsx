import { Link } from 'react-router-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import i18n from '../../services/i18n';
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

  function changeLanguage(lng: string) {
    i18n.changeLanguage(lng);
    closeMenus();
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
            if (event.target instanceof Element && event.target.closest('a'))
              closeMenus();
          }}
        >
          <Navigation aria-label={t('mainNavigation', { ns: 'common' })}>
            <Link to="/play">{t('play', { ns: 'navigation' })}</Link>
            <Link to="/watch">{t('watch', { ns: 'navigation' })}</Link>
            <Link to="/rankings">{t('rankings', { ns: 'navigation' })}</Link>
          </Navigation>

          <Auth>
            <Button to="/login" variant="secondary">
              {t('logIn', { ns: 'auth' })}
            </Button>
            <Button to="/register" variant="primary">
              {t('signUp', { ns: 'auth' })}
            </Button>

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
                      aria-current={i18n.language === 'fr' ? 'true' : undefined}
                      onClick={() => changeLanguage('fr')}
                    >
                      {t('french', { ns: 'navigation' })}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      lang="es"
                      aria-current={i18n.language === 'es' ? 'true' : undefined}
                      onClick={() => changeLanguage('es')}
                    >
                      {t('spanish', { ns: 'navigation' })}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      lang="en"
                      aria-current={i18n.language === 'en' ? 'true' : undefined}
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

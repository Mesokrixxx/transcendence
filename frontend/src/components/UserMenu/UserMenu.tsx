import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Avatar from '../Avatar/Avatar';
import { AccountMenu, AccountButton, AccountOptions } from './UserMenu.styles';

type UserMenuProps = {
  username: string;
  avatar?: string | null;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
};

function UserMenu({
  username,
  avatar,
  isLoggingOut,
  onLogout,
}: UserMenuProps) {
  const { t } = useTranslation('navigation');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  return (
    <AccountMenu
      ref={menuRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <AccountButton
        ref={buttonRef}
        type="button"
        aria-label={t('accountOptionsFor', { username })}
        aria-expanded={isOpen}
        aria-controls={optionsId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">
          <Avatar src={avatar || '/avatars/default.svg'} username={username} size={36} isOnline={true} />
        </span>

        <span className="username">{username}</span>

        <span aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
      </AccountButton>

      {isOpen && (
        <AccountOptions
          id={optionsId}
          aria-label={t('accountNavigation')}
        >
          <Link to="/profile" onClick={() => setIsOpen(false)}>
            {t('profile')}
          </Link>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => {
              void onLogout();
            }}
          >
            {isLoggingOut ? t('loggingOut') : t('logOut')}
          </button>
        </AccountOptions>
      )}
    </AccountMenu>
  );
}

export default UserMenu;
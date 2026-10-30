import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../Avatar/Avatar'
import {
  AccountMenu,
  AccountButton,
  AccountOptions
} from './UserMenu.styles'

type UserMenuProps = {
  username: string
  isLoggingOut: boolean
  onLogout: () => Promise<void>
}

function UserMenu({
  username,
  isLoggingOut,
  onLogout
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const optionsId = useId()

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen])

  return (
    <AccountMenu
      ref={menuRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
        }
      }}
    >
      <AccountButton
        ref={buttonRef}
        type="button"
        aria-label={`Account options for ${username}`}
        aria-expanded={isOpen}
        aria-controls={optionsId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">
          <Avatar username={username} size={36} isOnline={true}/>
        </span>

        <span className="username">{username}</span>

        <span aria-hidden="true">
          {isOpen ? '▴' : '▾'}
        </span>
      </AccountButton>

      {isOpen && (
        <AccountOptions
          id={optionsId}
          aria-label="Account navigation"
        >
          <Link
            to="/Profile"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => {
              void onLogout()
            }}
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </AccountOptions>
      )}
    </AccountMenu>
  )
}

export default UserMenu

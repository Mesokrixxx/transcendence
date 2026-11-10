import { useState } from 'react'
import { useTranslation } from 'react-i18next';
import FriendsPanel from './FriendsPanel'

function FriendsTest() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation('friends');

  return (
    <main className="container">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="friends-panel"
        onClick={() => setIsOpen(!isOpen)}
      >
        {t('panelTitle')}
      </button>

      {isOpen && <FriendsPanel onClose={() => setIsOpen(false)} />}
    </main>
  )
}

export default FriendsTest
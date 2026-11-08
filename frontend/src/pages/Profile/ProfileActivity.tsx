import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Messaging from '../Chat/Messaging';
import { ActivityPanel, ActivityTabs, ActivityTab, ActivityContent } from './ProfileActivity.styles';

const tabs = ['history', 'friends', 'messages'] as const;
type Tab = (typeof tabs)[number];

function ProfileActivity() {
  const { t } = useTranslation('profile');
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const id = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveTab(tabs[nextIndex]);

    event.currentTarget
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  }

  return (
    <ActivityPanel>
      <ActivityTabs
        role="tablist"
        aria-label={t('profileActivity')}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => (
          <ActivityTab
            key={tab}
            type="button"
            role="tab"
            id={`${id}-${tab}-tab`}
            aria-controls={`${id}-${tab}-panel`}
            aria-selected={activeTab === tab}
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'history'
              ? t('gameHistory')
              : tab === 'friends'
                ? t('friends')
                : t('messages', { ns: 'chat' })}
          </ActivityTab>
        ))}
      </ActivityTabs>

      <ActivityContent
        role="tabpanel"
        id={`${id}-history-panel`}
        aria-labelledby={`${id}-history-tab`}
        hidden={activeTab !== 'history'}
        tabIndex={0}
      >
        <p>{t('historyPlaceholder')}</p>
      </ActivityContent>

      <ActivityContent
        role="tabpanel"
        id={`${id}-friends-panel`}
        aria-labelledby={`${id}-friends-tab`}
        hidden={activeTab !== 'friends'}
        tabIndex={0}
      >
        <p>{t('friendsPlaceholder')}</p>
      </ActivityContent>

      <ActivityContent
        className="messages-panel"
        role="tabpanel"
        id={`${id}-messages-panel`}
        aria-labelledby={`${id}-messages-tab`}
        hidden={activeTab !== 'messages'}
        tabIndex={0}
      >
        <Messaging />
      </ActivityContent>
    </ActivityPanel>
  );
}

export default ProfileActivity;
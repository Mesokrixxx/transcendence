import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityPanel, ActivityTabs, ActivityTab,ActivityContent } from './ProfileActivity.styles';

function ProfileActivity() {
  const { t } = useTranslation('profile');
  const [activeTab, setActiveTab] = useState<'history' | 'friends'>(
    'history',
  );
  const id = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let nextTab: 'history' | 'friends';

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        nextTab = activeTab === 'history' ? 'friends' : 'history';
        break;
      case 'Home':
        nextTab = 'history';
        break;
      case 'End':
        nextTab = 'friends';
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveTab(nextTab);

    const buttons =
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );

    buttons[nextTab === 'history' ? 0 : 1]?.focus();
  }

  return (
    <ActivityPanel>
      <ActivityTabs
        role="tablist"
        aria-label={t('profileActivity')}
        onKeyDown={handleKeyDown}
      >
        <ActivityTab
          type="button"
          role="tab"
          id={`${id}-history-tab`}
          aria-controls={`${id}-history-panel`}
          aria-selected={activeTab === 'history'}
          tabIndex={activeTab === 'history' ? 0 : -1}
          onClick={() => setActiveTab('history')}
        >
          {t('gameHistory')}
        </ActivityTab>

        <ActivityTab
          type="button"
          role="tab"
          id={`${id}-friends-tab`}
          aria-controls={`${id}-friends-panel`}
          aria-selected={activeTab === 'friends'}
          tabIndex={activeTab === 'friends' ? 0 : -1}
          onClick={() => setActiveTab('friends')}
        >
          {t('friends')}
        </ActivityTab>
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
    </ActivityPanel>
  );
}

export default ProfileActivity;
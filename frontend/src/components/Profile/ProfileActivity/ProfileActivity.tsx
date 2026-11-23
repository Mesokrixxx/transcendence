import { useId, useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import History from '../../History/History';
import Messaging from '../../../pages/Chat/Messaging';
import FriendsPanel from '../../Friends/FriendsPanel/FriendsPanel';
import Statistics from '../../Statistics/Statistics';
import { ActivityPanel, ActivityTabs, ActivityTab, ActivityContent, StatusMessage } from './ProfileActivity.styles';
import { getUserGames } from '../../../services/game';
import type { Game } from '../../../types/game';

const tabs = ['history', 'friends', 'messages', 'stats'] as const;
type Tab = (typeof tabs)[number];

function ProfileActivity({ userId }: { userId: number }) {
  const { t } = useTranslation('profile');
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const id = useId();
  const [games, setGames] = useState<Game [] | null>(null);
  const [gamesLoading, setGamesLoading] = useState(true);

  useEffect(() => {
    setGamesLoading(true);
    getUserGames(userId).then((g) => {
      setGames(g);
    }).catch(() => {
      setGames(null);
    }).finally(() => {
      setGamesLoading(false);
    });
  }, [userId]);

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
                : tab === 'messages'
                  ? t('messages', { ns: 'chat' })
                  : t('statistics', { ns: 'statistics' })}
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
        {gamesLoading ? (
          <StatusMessage>{t('loading', { ns: 'common' })}</StatusMessage>
        ) : games === null ? (
          <StatusMessage>{t('activityLoadError')}</StatusMessage>
        ) : (
          <History games={games} userId={userId} />
        )}
      </ActivityContent>

      <ActivityContent
        role="tabpanel"
        id={`${id}-friends-panel`}
        aria-labelledby={`${id}-friends-tab`}
        hidden={activeTab !== 'friends'}
        tabIndex={0}
      >
        <FriendsPanel embedded />
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

      <ActivityContent
        role="tabpanel"
        id={`${id}-stats-panel`}
        aria-labelledby={`${id}-stats-tab`}
        hidden={activeTab !== 'stats'}
        tabIndex={0}
      >
        {gamesLoading ? (
          <StatusMessage>{t('loading', { ns: 'common' })}</StatusMessage>
        ) : games === null ? (
          <StatusMessage>{t('activityLoadError')}</StatusMessage>
        ) : (
          <Statistics games={games} userId={userId} />
        )}
      </ActivityContent>
    </ActivityPanel>
  );
}

export default ProfileActivity;

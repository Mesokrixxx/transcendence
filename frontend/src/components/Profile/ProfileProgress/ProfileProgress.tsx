import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import {
  getMyProgress,
  setBadgeFeatured,
  type GamificationProgress,
} from '../../../services/gamification';
import realtimeSocket, { type RealtimeEvent } from '../../../services/websocket';
import {
  Achievement,
  BadgeButton,
  BadgeList,
  BadgeStat,
  ProgressCard,
} from './ProfileProgress.styles';

const achievementTranslations = {
  'first-game': {
    name: 'achievementFirstGameName',
    description: 'achievementFirstGameDescription',
  },
  'three-wins': {
    name: 'achievementThreeWinsName',
    description: 'achievementThreeWinsDescription',
  },
  'elo-1600': {
    name: 'achievementElo1600Name',
    description: 'achievementElo1600Description',
  },
  'elo-1800': {
    name: 'achievementElo1800Name',
    description: 'achievementElo1800Description',
  },
} as const;

const badgeTranslations = {
  'win-streak-record': {
    name: 'badgeWinStreakName',
    description: 'badgeWinStreakDescription',
    stat: 'badgeWinStreakStat',
  },
  'consecutive-days-record': {
    name: 'badgeConsecutiveDaysName',
    description: 'badgeConsecutiveDaysDescription',
    stat: 'badgeConsecutiveDaysStat',
  },
  'daily-games-record': {
    name: 'badgeDailyGamesName',
    description: 'badgeDailyGamesDescription',
    stat: 'badgeDailyGamesStat',
  },
  'highest-elo-record': {
    name: 'badgeHighestEloName',
    description: 'badgeHighestEloDescription',
    stat: 'badgeHighestEloStat',
  },
} as const;

type ProgressState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: GamificationProgress };

function ProfileProgress() {
  const { t } = useTranslation('profile');
  const { user } = useAuth();
  const [state, setState] = useState<ProgressState>({ status: 'loading' });
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        const response = await getMyProgress();
        if (!active) return;

        if (response.error) {
          setState({ status: 'error' });
          return;
        }

        setState({ status: 'ready', data: response.result });
      } catch {
        if (active) setState({ status: 'error' });
      }
    }

    void loadProgress();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function updateProgress(event: RealtimeEvent) {
      if (
        event.type !== 'gamification.updated' ||
        event.userId !== user?.id ||
        !event.progress ||
        typeof event.progress !== 'object'
      ) return;

      setState({ status: 'ready', data: event.progress as GamificationProgress });
    }

    return realtimeSocket.subscribe(updateProgress);
  }, [user?.id]);

  async function toggleFeatured(code: string, featured: boolean) {
    if (featured && state.status === 'ready') {
      const featuredCount = state.data.badges.filter(
        (badge) => badge.featured,
      ).length;
      if (featuredCount >= 3) return;
    }

    setActionError(false);
    const response = await setBadgeFeatured(code, featured);
    if (response.error) {
      setActionError(true);
      return;
    }

    setState((current) =>
      current.status !== 'ready'
        ? current
        : {
            status: 'ready',
            data: {
              ...current.data,
              badges: current.data.badges.map((item) =>
                item.badge.code === code ? { ...item, featured } : item,
              ),
            },
          },
    );
  }

  return (
    <ProgressCard aria-labelledby="profile-progress-title">
      <h2 id="profile-progress-title">{t('progressTitle')}</h2>

      {state.status === 'loading' && (
        <p role="status">{t('progressLoading')}</p>
      )}

      {state.status === 'error' && (
        <p role="alert">{t('progressLoadError')}</p>
      )}

      {state.status === 'ready' && (
        <>
          <h3>{t('progressAchievements')}</h3>
          {state.data.achievements.length === 0 ? (
            <p>{t('progressNoAchievements')}</p>
          ) : (
            <ul>
              {state.data.achievements.map(({ achievement, unlocked, stats }) => {
                const translation =
                  achievementTranslations[
                    achievement.code as keyof typeof achievementTranslations
                  ];
                const name = translation ? t(translation.name) : achievement.name;
                const description = translation
                  ? t(translation.description, stats)
                  : achievement.description;

                return (
                  <Achievement
                      key={achievement.id}
                      title={description}
                      aria-label={`${name}: ${description}`}
                      $unlocked={unlocked}
                    >
                      {name}
                    </Achievement>
                );
              })}
            </ul>
          )}

          <h3>{t('progressBadges')}</h3>
          {state.data.badges.length === 0 ? (
            <p>{t('progressNoBadges')}</p>
          ) : (
            <BadgeList>
              {state.data.badges.map(({ badge }) => {
                const translation =
                  badgeTranslations[
                    badge.code as keyof typeof badgeTranslations
                  ];
                const name = translation ? t(translation.name) : badge.name;
                const description = translation
                  ? t(translation.description)
                  : badge.description;
                const isUnlocked = state.data.badges.find(
                  (item) => item.badge.id === badge.id,
                )?.unlocked ?? false;
                const currentBadge = state.data.badges.find(
                  (item) => item.badge.id === badge.id,
                );
                const stat =
                  translation &&
                  currentBadge?.unlocked &&
                  currentBadge.record > 0
                  ? t(translation.stat, { value: currentBadge.record })
                  : '';

                return (
                  <li key={badge.id}>
                    <BadgeButton
                      type="button"
                      disabled={!isUnlocked}
                      $featured={currentBadge?.featured ?? false}
                      title={stat ? `${description} ${stat}` : description}
                      aria-label={`${name}: ${description}${stat ? ` ${stat}` : ''}`}
                      aria-pressed={currentBadge?.featured ?? false}
                      onClick={() =>
                        isUnlocked &&
                        void toggleFeatured(badge.code, !(currentBadge?.featured ?? false))
                      }
                    >
                      {name}
                      {stat && <BadgeStat>{stat}</BadgeStat>}
                    </BadgeButton>
                  </li>
                );
              })}
            </BadgeList>
          )}
          {actionError && <p role="alert">{t('badgeUpdateError')}</p>}
        </>
      )}
    </ProgressCard>
  );
}

export default ProfileProgress;
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getMyProgress,
  getFeaturedBadges,
  setBadgeFeatured,
  type FeaturedBadge,
  type GamificationProgress,
} from '../../../services/gamification';
import realtimeSocket, {
  type RealtimeEvent,
} from '../../../services/websocket';
import {
  Achievement,
  BadgeButton,
  BadgeList,
  BadgeStat,
  ProgressCard,
} from './ProfileProgress.styles';

interface ProfileProgressProps {
  userId: number;
  isOwnProfile: boolean;
}

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
  | { status: 'own'; data: GamificationProgress }
  | { status: 'visitor'; data: FeaturedBadge[] };

function ProfileProgress({ userId, isOwnProfile }: ProfileProgressProps) {
  const { t } = useTranslation('profile');
  const [state, setState] = useState<ProgressState>({ status: 'loading' });
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      setActionError(false);
      setState({ status: 'loading' });

      try {
        if (isOwnProfile) {
          const response = await getMyProgress();
          if (!active) return;

          if (response.error) {
            setState({ status: 'error' });
            return;
          }

          setState({ status: 'own', data: response.result });
        } else {
          const response = await getFeaturedBadges(userId);
          if (!active) return;

          if (response.error) {
            setState({ status: 'error' });
            return;
          }

          setState({ status: 'visitor', data: response.result });
        }
      } catch {
        if (active) setState({ status: 'error' });
      }
    }

    void loadProgress();

    return () => {
      active = false;
    };
  }, [userId, isOwnProfile]);

  useEffect(() => {
    function updateProgress(event: RealtimeEvent) {
      if (event.type !== 'gamification.updated' || event.userId !== userId)
        return;

      if (isOwnProfile && event.progress && typeof event.progress === 'object')
        setState({
          status: 'own',
          data: event.progress as GamificationProgress,
        });
      if (!isOwnProfile && Array.isArray(event.featuredBadges))
        setState({
          status: 'visitor',
          data: event.featuredBadges as FeaturedBadge[],
        });
    }

    return realtimeSocket.subscribe(updateProgress);
  }, [userId, isOwnProfile]);

  async function toggleFeatured(code: string, featured: boolean) {
    if (state.status !== 'own') return;
    if (featured) {
      const featuredCount = state.data.badges.filter(
        (badge) => badge.featured,
      ).length;
      if (featuredCount >= 3) return;
    }

    setActionError(false);
    try {
      const response = await setBadgeFeatured(code, featured);
      if (response.error) {
        setActionError(true);
        return;
      }

      setState((current) =>
        current.status !== 'own'
          ? current
          : {
              status: 'own',
              data: {
                ...current.data,
                badges: current.data.badges.map((item) =>
                  item.badge.code === code ? { ...item, featured } : item,
                ),
              },
            },
      );
    } catch {
      setActionError(true);
    }
  }

  if (state.status === 'visitor') {
    if (state.data.length === 0) return null;

    return (
      <ProgressCard aria-labelledby="profile-progress-title">
        <h2 id="profile-progress-title">{t('featuredBadges')}</h2>

        <BadgeList>
          {state.data.map(({ badge, record }) => {
            const translation =
              badgeTranslations[badge.code as keyof typeof badgeTranslations];
            const name = translation ? t(translation.name) : badge.name;
            const description = translation
              ? t(translation.description)
              : badge.description;
            const stat =
              translation && record > 0
                ? t(translation.stat, { value: record })
                : '';

            return (
              <li key={badge.id}>
                <span title={description}>
                  {name}
                  {stat && <BadgeStat>{stat}</BadgeStat>}
                </span>
              </li>
            );
          })}
        </BadgeList>
      </ProgressCard>
    );
  }
  return (
    <ProgressCard aria-labelledby="profile-progress-title">
      <h2 id="profile-progress-title">{t('progressTitle')}</h2>

      {state.status === 'loading' && (
        <p role="status">{t('progressLoading')}</p>
      )}

      {state.status === 'error' && <p role="alert">{t('progressLoadError')}</p>}

      {state.status === 'own' && (
        <>
          <h3>{t('progressAchievements')}</h3>
          {state.data.achievements.length === 0 ? (
            <p>{t('progressNoAchievements')}</p>
          ) : (
            <ul>
              {state.data.achievements.map(
                ({ achievement, unlocked, stats }) => {
                  const translation =
                    achievementTranslations[
                      achievement.code as keyof typeof achievementTranslations
                    ];
                  const name = translation
                    ? t(translation.name)
                    : achievement.name;
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
                },
              )}
            </ul>
          )}

          <h3>{t('progressBadges')}</h3>
          {state.data.badges.length === 0 ? (
            <p>{t('progressNoBadges')}</p>
          ) : (
            <BadgeList>
              {state.data.badges.map(
                ({ badge, unlocked, featured, record }) => {
                  const translation =
                    badgeTranslations[
                      badge.code as keyof typeof badgeTranslations
                    ];
                  const name = translation ? t(translation.name) : badge.name;
                  const description = translation
                    ? t(translation.description)
                    : badge.description;
                  const stat =
                    translation && unlocked && record > 0
                      ? t(translation.stat, { value: record })
                      : '';

                  return (
                    <li key={badge.id}>
                      <BadgeButton
                        type="button"
                        disabled={!unlocked}
                        $featured={featured ?? false}
                        title={stat ? `${description} ${stat}` : description}
                        aria-label={`${name}: ${description}${stat ? ` ${stat}` : ''}`}
                        aria-pressed={featured ?? false}
                        onClick={() =>
                          unlocked &&
                          void toggleFeatured(badge.code, !(featured ?? false))
                        }
                      >
                        {name}
                        {stat && <BadgeStat>{stat}</BadgeStat>}
                      </BadgeButton>
                    </li>
                  );
                },
              )}
            </BadgeList>
          )}
          {actionError && <p role="alert">{t('badgeUpdateError')}</p>}
        </>
      )}
    </ProgressCard>
  );
}

export default ProfileProgress;

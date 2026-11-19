import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  getMyProgress,
  type GamificationProgress,
} from '../../services/gamification';

const ProgressCard = styled.section`
  margin-block: 24px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);

  h2 {
    margin: 0 0 8px;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
    list-style: none;
  }

  li {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
  }
`;

type ProgressState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: GamificationProgress };

function ProfileProgress() {
  const { t } = useTranslation('profile');
  const [state, setState] = useState<ProgressState>({ status: 'loading' });

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
              {state.data.achievements.map(({ achievement }) => (
                <li key={achievement.id}>{achievement.name}</li>
              ))}
            </ul>
          )}

          <h3>{t('progressBadges')}</h3>
          {state.data.badges.length === 0 ? (
            <p>{t('progressNoBadges')}</p>
          ) : (
            <ul>
              {state.data.badges.map(({ badge }) => (
                <li key={badge.id}>{badge.name}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </ProgressCard>
  );
}

export default ProfileProgress;
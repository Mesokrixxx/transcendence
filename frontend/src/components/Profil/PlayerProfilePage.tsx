import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Avatar from '../../components/Avatar/Avatar';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import { getPlayerProfile, type PlayerProfile } from '../../services/playerProfile';
import { Page } from '../../pages/Home/Home.styles';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import { ProfileHeader, ProfilePanel } from '../../pages/Profile/Profile.styles';
import {
  getFeaturedBadges,
  type FeaturedBadge,
} from '../../services/gamification';
import styled from 'styled-components';

const FeaturedBadges = styled.div`
  margin-top: 24px;

  h2 {
    margin: 0 0 12px;
    color: var(--color-primary);
    font-size: 1.1rem;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding: 10px 14px;
    border: 2px solid var(--color-primary);
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
    font-weight: 600;
  }

  small {
    display: block;
    margin-top: 4px;
    color: var(--color-text-secondary);
    font-weight: 400;
  }
`;

const badgeNames = {
  'win-streak-record': 'badgeWinStreakName',
  'consecutive-days-record': 'badgeConsecutiveDaysName',
  'daily-games-record': 'badgeDailyGamesName',
  'highest-elo-record': 'badgeHighestEloName',
} as const;

type ProfileState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; player: PlayerProfile };

function PlayerProfileDetails({ id }: { id: number }) {
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
  const [featuredBadges, setFeaturedBadges] = useState<FeaturedBadge[]>([]);
  const { t } = useTranslation('profile');

  useEffect(() => {
    let active = true;

    void getPlayerProfile(id).then((response) => {
      if (!active) return;

      if (response.error) {
        const message =
          typeof response.result === 'string'
            ? response.result
            : response.result.error;

        setState({
          status: message === 'user not found' ? 'notFound' : 'error',
        });
        return;
      }

      setState({ status: 'ready', player: response.result });
    });

    return () => {
      active = false;
    };
    }, [id]);

    useEffect(() => {
      let active = true;
      void getFeaturedBadges(id).then((response) => {
        if (active && !response.error) setFeaturedBadges(response.result);
      });
      return () => {
        active = false;
      };
    }, [id]);

  useEffect(() => {
    function updateProfile(event: RealtimeEvent) {
      if (
        event.type !== 'profile.changed' ||
        event.userId !== id ||
        typeof event.username !== 'string' ||
        (event.avatar !== null && typeof event.avatar !== 'string') ||
        (event.displayName !== null && typeof event.displayName !== 'string')
      ) return;

      const username = event.username;
      const avatar = event.avatar;
      const displayName = event.displayName ?? null;
      setState((current) => current.status === 'ready'
        ? {
            ...current,
            player: {
              ...current.player,
              username,
              avatar,
              displayName,
            },
          }
        : current);
    }

    return realtimeSocket.subscribe(updateProfile);
  }, [id]);

  useEffect(() => {
    function updateBadges(event: RealtimeEvent) {
      if (
        event.type !== 'gamification.updated' ||
        event.userId !== id ||
        !Array.isArray(event.featuredBadges)
      ) return;

      setFeaturedBadges(event.featuredBadges as FeaturedBadge[]);
    }

    return realtimeSocket.subscribe(updateBadges);
  }, [id]);

    if (state.status === 'loading') {
        return <p role="status">{t('playerProfileLoading')}</p>;
    }

    if (state.status === 'notFound') {
        return <p role="alert">{t('playerNotFound')}</p>;
    }

    if (state.status === 'error') {
        return <p role="alert">{t('playerProfileLoadError')}</p>;
    }

  const { player } = state;

  return (
    <>
      <ProfileHeader>
        <Avatar
          src={player.avatar || '/avatars/default.svg'}
          username={player.username}
          size={96}
        />

        <div className="profile-info">
          <h1>{player.displayName?.trim() || player.username}</h1>
          {player.displayName && player.displayName !== player.username && (
            <p>@{player.username}</p>
          )}
          <p>{t('playerElo', { elo: player.elo })}</p>
          <p>{t('playerGamesPlayed', { games: player.gamesPlayed })}</p>
        </div>
      </ProfileHeader>
      {featuredBadges.length > 0 && (
        <FeaturedBadges>
          <h2>{t('featuredBadges')}</h2>
          <ul>
            {featuredBadges.map(({ badge, record }) => {
              const name =
                badgeNames[badge.code as keyof typeof badgeNames] !== undefined
                  ? t(badgeNames[badge.code as keyof typeof badgeNames])
                  : badge.name;
              return (
                <li key={badge.id} title={badge.description}>
                  {name}
                  {record > 0 && (
                    <small>{t('featuredBadgeRecord', { value: record })}</small>
                  )}
                </li>
              );
            })}
          </ul>
        </FeaturedBadges>
      )}
    </>
  );
}

function PlayerProfilePage() {
  const { id } = useParams();
  const playerId = Number(id);
  const { t } = useTranslation('profile');
  const validId = /^\d+$/.test(id ?? '') &&
    Number.isSafeInteger(playerId) && playerId > 0;

  return (
    <Page>
      <Navbar />

      <main className="container">
        <ProfilePanel>
          {validId ? (
            <PlayerProfileDetails key={playerId} id={playerId} />
          ) : (
            <p role="alert">{t('playerNotFound')}</p>
          )}
        </ProfilePanel>
      </main>

      <Footer />
    </Page>
  );
}

export default PlayerProfilePage;
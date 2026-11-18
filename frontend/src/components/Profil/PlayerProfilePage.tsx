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

type ProfileState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; player: PlayerProfile };

function PlayerProfileDetails({ id }: { id: number }) {
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
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
    function updateProfile(event: RealtimeEvent) {
      if (
        event.type !== 'profile.changed' ||
        event.userId !== id ||
        typeof event.username !== 'string' ||
        (event.avatar !== null && typeof event.avatar !== 'string')
      ) return;

      const username = event.username;
      const avatar = event.avatar;
      setState((current) => current.status === 'ready'
        ? {
            ...current,
            player: {
              ...current.player,
              username,
              avatar,
            },
          }
        : current);
    }

    return realtimeSocket.subscribe(updateProfile);
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
    <ProfileHeader>
      <Avatar
        src={player.avatar || '/avatars/default.svg'}
        username={player.username}
        size={96}
      />

      <div className="profile-info">
        <h1>{player.username}</h1>
        <p>{t('playerElo', { elo: player.elo })}</p>
        <p>{t('playerGamesPlayed', { games: player.gamesPlayed })}</p>
      </div>
    </ProfileHeader>
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
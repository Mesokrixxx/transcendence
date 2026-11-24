import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import { ProfilePanel, ProfileHeader, ProfileStatus, ProfileStatusContent } from './Profile.styles';
import EditProfileDialog from '../../components/Profile/EditProfileDialog/EditProfileDialog';
import type { LocalProfile } from '../../components/Profile/EditProfileDialog/EditProfileDialog';
import ProfileActivity from '../../components/Profile/ProfileActivity/ProfileActivity';
import ProfileProgress from '../../components/Profile/ProfileProgress/ProfileProgress';
import type { AuthUser } from '../../types/auth';
import { getPlayerProfile } from '../../services/playerProfile';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';

interface ProfileData {
  id: number;
  username: string;
  avatar: string | null;
  displayName: string | null;
}

interface LoadedProfile {
  profile: ProfileData;
  isOwnProfile: boolean;
}

type ProfileState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; data: LoadedProfile };

type ProfileLoadResult = Exclude<ProfileState, { status: 'loading' }>;

async function loadProfile(
  userId: number,
  currentUser: AuthUser,
): Promise<ProfileLoadResult> {
  const isOwnProfile = currentUser.id === userId;

  if (isOwnProfile) {
    return {
      status: 'ready',
      data: {
        profile: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar ?? null,
          displayName: currentUser.displayName ?? null,
        },
        isOwnProfile,
      }
    }
  }

  const response = await getPlayerProfile(userId);
  if (response.error) {
    const message =
      typeof response.result === 'string' ? response.result : response.result.error;
    return { status: message === 'user not found' ? 'notFound' : 'error' };
  }

  const player = response.result;

  return {
    status: 'ready',
    data: {
      profile: {
        id: player.id,
        username: player.username,
        avatar: player.avatar,
        displayName: player.displayName,
      },
      isOwnProfile,
    }
  }
};

function Profile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user , setUser} = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<ProfileState>({status: 'loading'});

  const playerId = id === undefined ? null : Number(id);

  const validId = id === undefined || (
    /^\d+$/.test(id) &&
      Number.isSafeInteger(playerId) &&
      playerId! > 0
  );

  const targetUserId = playerId ?? user?.id;

  useEffect(() => {
    if (!user || !validId) {
      setLoadedProfile({status: 'notFound'});
      return;
    }

    setIsEditing(false);
    setLoadedProfile({status: 'loading'});
    let active = true;

    loadProfile(playerId ?? user.id, user)
      .then((res) => {
        if (active) setLoadedProfile(res);
      })
      .catch(() => {
        if (active) setLoadedProfile({status: 'error'});
      })

    return () => {
      active = false;
    };
  }, [playerId, user, validId]);

  useEffect(() => {
    if (!targetUserId || targetUserId === user?.id) return;

    function updateProfile(event: RealtimeEvent) {

      if (
        event.type !== 'profile.changed' ||
        event.userId !== targetUserId ||
        typeof event.username !== 'string' ||
        (event.avatar !== null && typeof event.avatar !== 'string') ||
        (event.displayName !== null && typeof event.displayName !== 'string')
      ) return;

      const username = event.username;
      const avatar = event.avatar;
      const displayName = event.displayName ?? null;
      setLoadedProfile((current) => {
        if (current.status === 'ready') {
          return {
            ...current,
            data: {
              ...current.data,
              username,
              avatar,
              displayName,
            }
          }
        } else
          return current;
      });
    }

    return realtimeSocket.subscribe(updateProfile);
  }, [targetUserId, user?.id]);

  function handleSave(profile: LocalProfile) {
    if (user) {
      setUser({
        ...user,
        displayName: profile.displayName || null,
        avatar: profile.avatar ?? null,
      });
    }

    setIsEditing(false);
  }

  const profile = loadedProfile.status === 'ready' ? loadedProfile.data.profile : null;
  const isOwnProfile = loadedProfile.status === 'ready' ? loadedProfile.data.isOwnProfile : false;

  return (
    <Page>
      <Navbar />

      <main className="container">
        {loadedProfile.status === 'loading' && (
          <ProfileStatus>
            <ProfileStatusContent>{t('playerProfileLoading', { ns: 'profile' })}</ProfileStatusContent>
          </ProfileStatus>
        )}
        {loadedProfile.status === 'notFound' && (
          <ProfileStatus>
            <ProfileStatusContent>{t('playerNotFound', { ns: 'profile' })}</ProfileStatusContent>
          </ProfileStatus>
        )}
        {loadedProfile.status === 'error' && (
          <ProfileStatus>
            <ProfileStatusContent>{t('playerProfileLoadError', { ns: 'profile' })}</ProfileStatusContent>
          </ProfileStatus>
        )}
        {profile && <ProfilePanel>
          <ProfileHeader>
            <Avatar
              src={profile.avatar || '/avatars/default.svg'}
              username={profile.username}
              isOnline={isOwnProfile || undefined}
              size={96}
            />

            <div className="profile-info">
              <h1>{profile.displayName || profile.username}</h1>

              {profile.displayName && profile.displayName !== profile.username && (
                <p>@{profile.username}</p>
              )}

              {isOwnProfile && <p>{t('online', { ns: 'common' })}</p>}
            </div>

            {isOwnProfile && <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(true)}
              aria-expanded={isEditing}
              aria-controls="profile-edit"
            >
              {t('editProfile', { ns: 'profile' })}
            </Button>}
          </ProfileHeader>
          </ProfilePanel>}
          {profile && <ProfileProgress userId={profile.id} isOwnProfile={isOwnProfile} />}
          {profile && <ProfileActivity userId={profile.id} isOwnProfile={isOwnProfile} />}

        {isEditing && user && (
          <EditProfileDialog
            user={user}
            profile={{ displayName: user.displayName || user.username }}
            onClose={() => setIsEditing(false)}
            onSave={handleSave}
          />
        )}
      </main>

      <Footer />
    </Page>
  );
}

export default Profile;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import { ProfilePanel, ProfileHeader, ProfileStatus, ProfileStatusContent, ProfileActions } from './Profile.styles';
import EditProfileDialog from '../../components/Profile/EditProfileDialog/EditProfileDialog';
import type { LocalProfile } from '../../components/Profile/EditProfileDialog/EditProfileDialog';
import ProfileActivity from '../../components/Profile/ProfileActivity/ProfileActivity';
import ProfileProgress from '../../components/Profile/ProfileProgress/ProfileProgress';
import type { AuthUser } from '../../types/auth';
import { getPlayerProfile } from '../../services/playerProfile';
import realtimeSocket, { type RealtimeEvent } from '../../services/websocket';
import { getFriends, sendFriendRequest, acceptFriendRequest, removeFriendRequest, removeFriend, blockUser, unblockUser } from '../../services/friends';

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

type RelationshipStatus =
  | 'none'
  | 'friend'
  | 'incoming'
  | 'outgoing'
  | 'blocked';

type RelationshipState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready', relationship: RelationshipStatus };

async function getRelationship(userId: number): Promise<RelationshipStatus> {
  const data = await getFriends();

  if (data.blocked.some((u) => u.id === userId))
    return 'blocked';
  if (data.friends.some((u) => u.id === userId))
    return 'friend';
  if (data.received.some((u) => u.id === userId))
    return 'incoming';
  if (data.sent.some((u) => u.id === userId))
    return 'outgoing';
  return 'none';
}

function Profile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user , setUser} = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<ProfileState>({status: 'loading'});
  const [relationship, setRelationship] = useState<RelationshipState | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const playerId = id === undefined ? null : Number(id);

  const validId = id === undefined || (
    /^\d+$/.test(id) &&
      Number.isSafeInteger(playerId) &&
      playerId! > 0
  );

  const targetUserId = validId ? playerId ?? user?.id : undefined;

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
    if (!user || !targetUserId || targetUserId === user?.id) {
      setRelationship(null);
      return;
    }

    setRelationship({ status: 'loading'});
    let active = true;
    getRelationship(targetUserId)
      .then((r) => {
        if (active) setRelationship({ status: 'ready', relationship: r });
      })
      .catch(() => {
        if (active) setRelationship({ status: 'error' });
      })

      return () => {
        active = false;
      };
  }, [targetUserId, user]);

  async function changeRelationship<ArgT>(action: (arg: ArgT) => Promise<void>, arg: ArgT) {
    try {
      if (!user || !targetUserId || targetUserId === user?.id)
        return;

      setRelationship({ status: 'loading' });

      await action(arg);

      const r = await getRelationship(targetUserId);
      setRelationship({ status: 'ready', relationship: r });
    } catch {
      setRelationship({ status: 'error' });
    }
  }

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
              profile: {
                ...current.data.profile,
                username,
                avatar,
                displayName,
              }
            }
          }
        } else
          return current;
      });
    }

    return realtimeSocket.subscribe(updateProfile);
  }, [targetUserId, user?.id]);

  useEffect(() => {
    if (!user || !targetUserId || targetUserId === user?.id) return;

    const profileUserId = targetUserId;

    function updateRelationship(event: RealtimeEvent) {
        if (
            event.type !== 'friend.request.sent' &&
            event.type !== 'friend.request.accepted' &&
            event.type !== 'friend.changed' &&
            event.type !== 'friend.blocked' &&
            event.type !== 'friend.unblocked'
        ) return

        getRelationship(profileUserId)
            .then((result) => setRelationship({ status: 'ready', relationship: result }))
            .catch(() => setRelationship({ status: 'error' }))
    }

    return realtimeSocket.subscribe(updateRelationship)
  }, [targetUserId, user])

  useEffect(() => {
    if (!user || !targetUserId || targetUserId === user.id || relationship?.status !== 'ready' || relationship.relationship !== 'friend') {
      setIsOnline(null);
      return;
    }

    const profileUserId = targetUserId;
    let active = true;
    let hasPresenceUpdate = false;

    getFriends()
      .then((res) => {
        if (!active || hasPresenceUpdate) return;

        const friend = res.friends.find((f) => f.id === profileUserId);
        setIsOnline(friend?.isOnline ?? null);
      })
      .catch(() => {
        if (active && !hasPresenceUpdate) setIsOnline(null);
      });

    function updatePresence(event: RealtimeEvent) {
      if (event.type === 'presence.snapshot' && Array.isArray(event.users)) {
        const target = event.users.find(
          (user) =>
            user &&
            typeof user === 'object' &&
            'userId' in user &&
            'online' in user &&
            typeof user.userId === 'number' &&
            typeof user.online === 'boolean' &&
            user.userId === profileUserId 
        );
        hasPresenceUpdate = true;
        setIsOnline(target ? target.online : false);
        return;
      }

      if (
        event.type === 'presence.changed' &&
        typeof event.userId === 'number' &&
        typeof event.online === 'boolean' &&
        event.userId === targetUserId
      ) {
        hasPresenceUpdate = true;
        setIsOnline(event.online);
      }
    }

    const unsubscribe = realtimeSocket.subscribe(updatePresence);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [targetUserId, user, relationship]);

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
              isOnline={
                relationship?.status === 'ready' && 
                  relationship.relationship === 'friend'
                ? isOnline ?? undefined
                : isOwnProfile
                  ? true
                  : undefined
              }
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
            {!isOwnProfile && relationship?.status === 'ready' && (
              <ProfileActions>
                {relationship.relationship === 'none' && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(
                          sendFriendRequest,
                          profile.username,
                        )
                      }
                    >
                      {t('sendRequest', { ns: 'friends' })}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(blockUser, profile.id)
                      }
                    >
                      {t('block', { ns: 'friends' })}
                    </Button>
                  </>
                )}

                {relationship.relationship === 'outgoing' && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(removeFriendRequest, profile.id)
                      }
                    >
                      {t('cancel', { ns: 'friends' })}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(blockUser, profile.id)
                      }
                    >
                      {t('block', { ns: 'friends' })}
                    </Button>
                  </>
                )}

                {relationship.relationship === 'incoming' && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(acceptFriendRequest, profile.id)
                      }
                    >
                      {t('accept', { ns: 'friends' })}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(removeFriendRequest, profile.id)
                      }
                    >
                      {t('decline', { ns: 'friends' })}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(blockUser, profile.id)
                      }
                    >
                      {t('block', { ns: 'friends' })}
                    </Button>
                  </>
                )}

                {relationship.relationship === 'friend' && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(removeFriend, profile.id)
                      }
                    >
                      {t('remove', { ns: 'friends' })}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        changeRelationship(blockUser, profile.id)
                      }
                    >
                      {t('block', { ns: 'friends' })}
                    </Button>
                  </>
                )}

                {relationship.relationship === 'blocked' && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      changeRelationship(unblockUser, profile.id)
                    }
                  >
                    {t('unblock', { ns: 'friends' })}
                  </Button>
                )}
              </ProfileActions>
            )}
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

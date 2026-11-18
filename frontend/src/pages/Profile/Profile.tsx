import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import { ProfilePanel, ProfileHeader } from './Profile.styles';
import EditProfileDialog from '../../components/Profil/EditProfileDialog';
import type { LocalProfile } from '../../components/Profil/EditProfileDialog';
import ProfileActivity from '../../components/Profil/ProfileActivity';
function Profile() {
  const { t } = useTranslation();
  const { user , setUser} = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const localProfile: LocalProfile = {
    displayName: user?.displayName ?? '',
  };

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

  return (
    <Page>
      <Navbar />

      <main className="container">
        <ProfilePanel>
          <ProfileHeader>
            <Avatar
              src={user?.avatar || '/avatars/default.svg'}
              username={user?.username ?? ''}
              isOnline={true}
              size={96}
            />

            <div className="profile-info">
              <h1>{localProfile.displayName || user?.username}</h1>

              {user && localProfile.displayName && localProfile.displayName !== user.username && (
                <p>@{user.username}</p>
              )}

              <p>{t('online', { ns: 'common' })}</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(true)}
              aria-expanded={isEditing}
              aria-controls="profile-edit"
            >
              {t('editProfile', { ns: 'profile' })}
            </Button>
          </ProfileHeader>
        </ProfilePanel>

        { user && <ProfileActivity userId={user.id} /> }

        {isEditing && user && (
          <EditProfileDialog
            user={user}
            profile={localProfile}
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

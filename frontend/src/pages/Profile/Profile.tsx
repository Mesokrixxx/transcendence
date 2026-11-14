import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import { ProfilePanel, ProfileHeader } from './Profile.styles';
import EditProfileDialog from './EditProfileDialog';
import type { LocalProfile } from './EditProfileDialog';
import ProfileActivity from './ProfileActivity';

function Profile() {
  const { t } = useTranslation();
  const { user , setUser} = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const localProfile: LocalProfile = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  };

  const fullName = [
    localProfile.firstName,
    localProfile.lastName,
  ].filter(Boolean).join(' ');

  function handleSave(profile: LocalProfile) {
    if (user) {
      setUser({
        ...user,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
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
              <h1>{user?.username}</h1>
              <p>{t('online', { ns: 'common' })}</p>
              {fullName && <p>{fullName}</p>}
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

        <ProfileActivity />

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
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import { Page } from '../Home/Home.styles';
import { ProfilePanel, ProfileHeader, AvatarUpload } from './Profile.styles';
import { useTranslation } from 'react-i18next';

function Profile() {
  const { t } = useTranslation();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>();
  const [avatarError, setAvatarError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('UserName');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (!avatarFile) return;

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarSrc(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('chooseImageFormat');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('imageTooLarge');
      return;
    }

    setAvatarError('');
    setAvatarFile(file);
  }
  return (
    <Page>
      <Navbar />

      <main className="container">
        <ProfilePanel>
          <ProfileHeader>
            <Avatar
              src={avatarSrc}
              username={username}
              isOnline={true}
              size={96}
            />

            <div className="profile-info">
              <h1>{username}</h1>

              {(firstName || lastName) && (
                <p>{[firstName, lastName].filter(Boolean).join(' ')}</p>
              )}

              <p>{t('common:online')}</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(!isEditing)}
              aria-expanded={isEditing}
              aria-controls="profile-edit"
            >
              {isEditing ? t('common:close') : t('profile:editProfile')}
            </Button>
          </ProfileHeader>

          {isEditing && (
            <AvatarUpload id="profile-edit">
              <label htmlFor="profile-avatar">
                {t('profile:changeAvatar')}
              </label>
              <label htmlFor="profile-username">{t('auth:username')}</label>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />

              <label htmlFor="profile-firstname">
                {t('profile:firstNameOptional')}
              </label>
              <input
                id="profile-firstname"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
              />

              <label htmlFor="profile-lastname">
                {t('profile:lastNameOptional')}
              </label>
              <input
                id="profile-lastname"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
              />

              <input
                id="profile-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                aria-describedby="avatar-help avatar-error"
              />

              <p id="avatar-help">{t('profile:jpgPngOrWebpMaximum2Mb')}</p>

              <p id="avatar-error" role="alert">
                {avatarError ? t(`profile:${avatarError}`) : ''}
              </p>
            </AvatarUpload>
          )}
        </ProfilePanel>
      </main>

      <Footer />
    </Page>
  );
}

export default Profile;

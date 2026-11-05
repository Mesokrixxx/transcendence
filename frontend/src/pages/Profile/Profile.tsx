import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useAuth } from '../../context/AuthContext'
import type { AuthUser } from '../../types/auth';
import fetchAPI from '../../services/fetchAPI';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import Form from '../../components/Form/Form';
import Input from '../../components/Input/Input';
import { Page } from '../Home/Home.styles';
import { ProfilePanel, ProfileHeader, ProfileDialog, DialogHeader, DialogActions} from './Profile.styles';
import { useTranslation } from 'react-i18next';

type LocalProfile = {
  firstName: string;
  lastName: string;
  avatar?: string;
};

function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [localProfile, setLocalProfile] = useState<LocalProfile>({
    firstName: '',
    lastName: '',
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string>();

  const [avatarError, setAvatarError] = useState<
    'chooseImageFormat' | 'imageTooLarge' | ''
  >('');

  const [error, setError] = useState<
    'usernameInUse' | 'enterUsername' | 'saveError' | ''
  >('');

  const dialogRef = useRef<HTMLDialogElement>(null);
  const previewUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = previewUrls.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    dialogRef.current?.showModal();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditing]);

  function discardDraftAvatar() {
    if (avatarSrc && avatarSrc !== localProfile.avatar) {
      URL.revokeObjectURL(avatarSrc);
      previewUrls.current.delete(avatarSrc);
    }
  }

  function openEditor() {
    setUsername(user?.username ?? '');
    setFirstName(localProfile.firstName);
    setLastName(localProfile.lastName);
    setAvatarSrc(localProfile.avatar);
    setAvatarError('');
    setError('');
    setIsEditing(true);
  }

  function closeEditor() {
    if (isSaving) return;

    discardDraftAvatar();
    dialogRef.current?.close();
    setIsEditing(false);
    setError('');
    setAvatarError('');
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('chooseImageFormat');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('imageTooLarge');
      return;
    }

    discardDraftAvatar();

    const previewUrl = URL.createObjectURL(file);
    previewUrls.current.add(previewUrl);

    setAvatarSrc(previewUrl);
    setAvatarError('');
  }

  function applyLocalChanges() {
    if (
      localProfile.avatar &&
      localProfile.avatar !== avatarSrc
    ) {
      URL.revokeObjectURL(localProfile.avatar);
      previewUrls.current.delete(localProfile.avatar);
    }

    setLocalProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatar: avatarSrc,
    });

    dialogRef.current?.close();
    setIsEditing(false);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving || !user || avatarError) return;

    const nextUsername = username.trim();

    if (!nextUsername) {
      setError('enterUsername');
      return;
    }

    setError('');

    if (nextUsername === user.username) {
      applyLocalChanges();
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetchAPI<AuthUser>({
        path: '/users/me',
        method: 'patch',
        body: {
          username: nextUsername,
        },
      });

      if (response.error === true) {
        const message =
          typeof response.result === 'string'
            ? response.result
            : response.result.error;

        setError(
          message === 'username already exists'
            ? 'usernameInUse'
            : 'saveError',
        );

        return;
      }

      setUser(response.result);
      applyLocalChanges();
    } finally {
      setIsSaving(false);
    }
  }

  const fullName = [
    localProfile.firstName,
    localProfile.lastName,
  ].filter(Boolean).join(' ');

  return (
    <Page>
      <Navbar />

      <main className="container">
        <ProfilePanel>
          <ProfileHeader>
            <Avatar
              src={localProfile.avatar}
              username={user?.username ?? ''}
              isOnline={true}
              size={96}
            />

            <div className="profile-info">
              <h1>{user?.username}</h1>

              {fullName && <p>{fullName}</p>}

              <p>{t('online', { ns: 'common' })}</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={openEditor}
              aria-expanded={isEditing}
              aria-controls="profile-edit"
            >
              {t('editProfile', { ns: 'profile' })}
            </Button>
          </ProfileHeader>
        </ProfilePanel>

        {isEditing && (
          <ProfileDialog
            ref={dialogRef}
            id="profile-edit"
            aria-labelledby="profile-edit-title"
            onCancel={(event) => {
              event.preventDefault();
              closeEditor();
            }}
          >
            <DialogHeader>
              <h2 id="profile-edit-title">
                {t('editProfile', { ns: 'profile' })}
              </h2>

              <button
                type="button"
                onClick={closeEditor}
                disabled={isSaving}
                aria-label={t('close', { ns: 'common' })}
              >
                <span aria-hidden="true">×</span>
              </button>
            </DialogHeader>

            <Form
              aria-busy={isSaving}
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
            >
              <fieldset disabled={isSaving}>
                <div className="avatar-editor">
                  <Avatar
                    src={avatarSrc}
                    username={username || user?.username || ''}
                    size={80}
                  />

                  <Input
                    id="profile-avatar"
                    type="file"
                    label={t('changeAvatar', { ns: 'profile' })}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    aria-describedby="avatar-help avatar-error"
                  />
                </div>

                <p id="avatar-help" className="profile-help">
                  {t('jpgPngOrWebpMaximum2Mb', { ns: 'profile' })}
                </p>

                {avatarError && (
                  <p id="avatar-error" role="alert">
                    {t(avatarError, { ns: 'profile' })}
                  </p>
                )}

                <Input
                  id="profile-username"
                  name="username"
                  label={t('username', { ns: 'auth' })}
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.currentTarget.value);
                    setError('');
                  }}
                  maxLength={32}
                  required
                />

                <Input
                  id="profile-firstname"
                  name="firstName"
                  label={t('firstNameOptional', { ns: 'profile' })}
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.currentTarget.value);
                  }}
                />

                <Input
                  id="profile-lastname"
                  name="lastName"
                  label={t('lastNameOptional', { ns: 'profile' })}
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.currentTarget.value);
                  }}
                />

                {error && (
                  <p role="alert">
                    {error === 'saveError'
                      ? t('saveError', { ns: 'profile' })
                      : error === 'usernameInUse'
                        ? t('usernameInUse', { ns: 'auth' })
                        : t('enterUsername', { ns: 'auth' })}
                  </p>
                )}

                <DialogActions>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closeEditor}
                  >
                    {t('cancel', { ns: 'common' })}
                  </Button>

                  <Button type="submit">
                    {isSaving
                      ? t('saving', { ns: 'profile' })
                      : t('saveChanges', { ns: 'profile' })}
                  </Button>
                </DialogActions>
              </fieldset>
            </Form>
          </ProfileDialog>
        )}
      </main>

      <Footer />
    </Page>
  );
}

export default Profile;
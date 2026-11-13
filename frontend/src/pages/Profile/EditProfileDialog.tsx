import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import type { AuthUser } from '../../types/auth';
import fetchAPI from '../../services/fetchAPI';
import { uploadAvatar } from '../../services/avatar';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import Form from '../../components/Form/Form';
import Input from '../../components/Input/Input';
import { ProfileDialog, DialogHeader,DialogActions } from './Profile.styles';

export type LocalProfile = {
  firstName: string;
  lastName: string;
  avatar?: string;
};

type EditProfileDialogProps = {
  user: AuthUser;
  profile: LocalProfile;
  onClose: () => void;
  onSave: (profile: LocalProfile) => void;
};

function EditProfileDialog({
  user,
  profile,
  onClose,
  onSave,
}: EditProfileDialogProps) {
  const { t } = useTranslation();
  const { setUser } = useAuth();

  const [username, setUsername] = useState(user.username);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [isSaving, setIsSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatarOnSave, setRemoveAvatarOnSave] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(
    user.avatar || '/avatars/default.svg',
  );

  const [avatarError, setAvatarError] = useState<
    'chooseImageFormat' | 'imageTooLarge' | ''
  >('');

  const [error, setError] = useState<
    'usernameInUse' | 'enterUsername' | 'saveError' | ''
  >('');

  const dialogRef = useRef<HTMLDialogElement>(null);
  const draftAvatarRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog?.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;

      if (draftAvatarRef.current) {
        URL.revokeObjectURL(draftAvatarRef.current);
        draftAvatarRef.current = undefined;
      }
    };
  }, []);

  function closeEditor() {
    if (!isSaving) onClose();
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

    if (draftAvatarRef.current) {
      URL.revokeObjectURL(draftAvatarRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    draftAvatarRef.current = previewUrl;
    setAvatarSrc(previewUrl);
    setAvatarFile(file);
    setRemoveAvatarOnSave(false);
    setAvatarError('');
    setError('');

    }

  function handleResetAvatar() {
    if (draftAvatarRef.current) {
      URL.revokeObjectURL(draftAvatarRef.current);
      draftAvatarRef.current = undefined;
    }

    setAvatarFile(null);
    setAvatarSrc('/avatars/default.svg');
    setRemoveAvatarOnSave(Boolean(user.avatar));
    setAvatarError('');
    setError('');
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving || avatarError) return;

    const nextUsername = username.trim();

    if (!nextUsername) {
      setError('enterUsername');
      return;
    }

    setError('');
    setIsSaving(true);

    let updatedUser = user;

    try {
      if (nextUsername !== user.username) {
        const response = await fetchAPI<AuthUser>({
          path: '/users/me',
          method: 'patch',
          body: { username: nextUsername },
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

        updatedUser = {
          ...response.result,
          avatar: response.result.avatar ?? user.avatar,
        };

        setUser(updatedUser);
      }

      if (removeAvatarOnSave) {
        const response = await fetch('/api/users/me/avatar', {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Avatar removal failed');
        }

        updatedUser = { ...updatedUser, avatar: null };
        setUser(updatedUser);
      } else if (avatarFile) {
        const avatar = await uploadAvatar(avatarFile);

        updatedUser = { ...updatedUser, avatar };
        setUser(updatedUser);
        setAvatarFile(null);
        setAvatarSrc(avatar);
      }

      onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatar: updatedUser.avatar ?? undefined,
      });
    } catch {
      setError('saveError');
    } finally {
      setIsSaving(false);
    }
  }

  return (
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
              username={username || user.username}
              size={80}
            />

            <Input
              id="profile-avatar"
              type="file"
              label={t('changeAvatar', { ns: 'profile' })}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              aria-describedby={
                avatarError ? 'avatar-help avatar-error' : 'avatar-help'
              }
            />
          </div>

          <p id="avatar-help" className="profile-help">
            {t('jpgPngOrWebpMaximum2Mb', { ns: 'profile' })}
          </p>

           {(avatarFile || (user.avatar && !removeAvatarOnSave)) && (
            <Button type="button" variant="secondary" onClick={handleResetAvatar}>
              {t('resetAvatar', { ns: 'profile' })}
            </Button>
          )}

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
            onChange={(event) => setFirstName(event.currentTarget.value)}
          />

          <Input
            id="profile-lastname"
            name="lastName"
            label={t('lastNameOptional', { ns: 'profile' })}
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.currentTarget.value)}
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
  );
}

export default EditProfileDialog;
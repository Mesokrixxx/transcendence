import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import type { AuthUser } from '../../types/auth';
import { uploadAvatar } from '../../services/avatar';
import { updateProfileNames } from '../../services/profile';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import Form from '../../components/Form/Form';
import Input from '../../components/Input/Input';
import { ProfileDialog, DialogHeader, DialogActions } from './Profile.styles';

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
  const [error, setError] = useState<'saveError' | ''>('');

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

    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();

    setError('');
    setIsSaving(true);

    let updatedUser = user;

    try {
      if (
        nextFirstName !== profile.firstName ||
        nextLastName !== profile.lastName
      ) {
        await updateProfileNames(nextFirstName, nextLastName);
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
        setRemoveAvatarOnSave(false);
      } else if (avatarFile) {
        const avatar = await uploadAvatar(avatarFile);

        updatedUser = { ...updatedUser, avatar };
        setUser(updatedUser);
        setAvatarFile(null);
        setAvatarSrc(avatar);
      }

      onSave({
        firstName: nextFirstName,
        lastName: nextLastName,
        ...(updatedUser.avatar ? { avatar: updatedUser.avatar } : {}),
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
            <Avatar src={avatarSrc} username={user.username} size={80} />

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

          <div className="profile-username-display">
            <span>{t('username', { ns: 'auth' })}</span>
            <p>{user.username}</p>
          </div>

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

          {error && <p role="alert">{t('saveError', { ns: 'profile' })}</p>}

          <DialogActions>
            <Button type="button" variant="secondary" onClick={closeEditor}>
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
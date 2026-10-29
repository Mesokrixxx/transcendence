import { useTranslation } from 'react-i18next';
import {
  AvatarWrapper,
  AvatarImage,
  AvatarFallback,
  StatusDot,
} from './Avatar.styles';

type AvatarProps = {
  src?: string;
  username: string;
  isOnline?: boolean;
  size?: number;
};

function Avatar({ src, username, isOnline, size = 64 }: AvatarProps) {
  const { t } = useTranslation();
  const avatarLabel = t('avatarOfUsername', { ns: 'profile', username });
  const onlineLabel = isOnline ? t('online', { ns: 'common' }) : t('offline', { ns: 'common' });

  return (
    <AvatarWrapper $size={size}>
      {src ? (
        <AvatarImage src={src} alt={avatarLabel} />
      ) : (
        <AvatarFallback aria-label={avatarLabel}>
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      )}
      {isOnline !== undefined && (
        <StatusDot
          $isOnline={isOnline}
          role="img"
          aria-label={onlineLabel}
          title={onlineLabel}
        />
      )}
    </AvatarWrapper>
  );
}

export default Avatar;

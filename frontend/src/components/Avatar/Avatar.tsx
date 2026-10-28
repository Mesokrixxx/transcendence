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
  const avatarLabel = t('profile:avatarOfUsername', { username });
  const onlineLabel = isOnline ? t('common:online') : t('common:offline');

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

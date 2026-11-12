import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import { OAuthOptions, Separator } from './GitHubSignIn.styles';

function GitHubSignIn() {
  const { t } = useTranslation('auth');

  const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
  const redirectURI = import.meta.env.VITE_OAUTH_REDIRECT_URI;

  const isEnabled =
    typeof clientId === 'string' &&
    typeof redirectURI === 'string' &&
    clientId.trim().length > 0 &&
    redirectURI.trim().length > 0;

  if (!isEnabled) return null;

  return (
    <OAuthOptions>
      <Button to="/github-signin" variant="secondary">
        {t('ghSignIn')}
      </Button>
      <Separator>{t('or')}</Separator>
    </OAuthOptions>
  );
}

export default GitHubSignIn;
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Form from '../../components/Form/Form';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Footer from '../../components/Footer/Footer';
import fetchAPI from '../../services/fetchAPI';
import type { AuthUser } from '../../types/auth';
import { Page } from '../Home/Home.styles';
import { AuthContent, AuthPanel, AuthHint } from './Auth.styles';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    setError('');
    setUser(null);

    if (typeof email !== 'string' || typeof password !== 'string') {
      setError(t('auth:enterEmailAndPassword'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchAPI<AuthUser>({
        path: '/auth/login',
        method: 'post',
        body: {
          email: email.trim(),
          password,
        },
      });

      if (response.error == true) {
        if (typeof response.result === 'string') {
          setError(response.result);
        } else {
          setError(response.result.error);
        }

        return;
      }
      setUser(response.result);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Page>
      <Navbar />

      <AuthContent className="container">
        <AuthPanel>
          <h1>{t('auth:welcomeBack')}</h1>
          <Form onSubmit={handleSubmit}>
            <Input
              id="login-email"
              name="email"
              label={t('auth:email')}
              type="email"
              placeholder={t('auth:emailPlaceholder')}
              autoComplete="email"
              required
            />

            <Input
              id="login-password"
              name="password"
              label={t('auth:password')}
              type="password"
              placeholder={t('auth:yourPassword')}
              autoComplete="current-password"
              required
            />

            <Button type="submit">{t('auth:logIn')}</Button>

            {isLoading && <p role="status">{t('auth:loggingIn')}</p>}

            {error && <p role="alert">{error}</p>}

            {user && (
              <p role="status">
                {t('auth:loggedInAs', { username: user.username })}
              </p>
            )}
          </Form>

          <AuthHint>
            {t('auth:noAccountYet')}{' '}
            <Link to="/register">{t('auth:signUp')}</Link>
          </AuthHint>
        </AuthPanel>
      </AuthContent>

      <Footer />
    </Page>
  );
}

export default Login;

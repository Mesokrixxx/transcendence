import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Form from '../../components/Form/Form';
import GitHubSignIn from '../../components/GitHubSignIn/GitHubSignIn';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Footer from '../../components/Footer/Footer';
import fetchAPI from '../../services/fetchAPI';
import { translateApiError } from '../../services/apiErrors';
import type { AuthUser } from '../../types/auth';
import { Page } from '../Home/Home.styles';
import { AuthContent, AuthPanel, AuthHint } from './Auth.styles';

function Login() {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get('email');
    const passwordValue = formData.get('password');
    const email = typeof emailValue === 'string' ? emailValue.trim() : '';
    const password = typeof passwordValue === 'string' ? passwordValue : '';

    setError('');

    if (email === '' || password === '') {
      setError(t('enterEmailAndPassword', { ns: 'auth' }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('invalidEmail', { ns: 'auth' }));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort', { ns: 'auth' }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchAPI<AuthUser>({
        path: '/auth/login',
        method: 'post',
        body: {
          email,
          password,
        },
      });

      if (response.error === true) {
        setError(
          translateApiError(
            response.result,
            t('unknownError', { ns: 'errors' }),
          ),
        );

        return;
      }

      setUser(response.result);
      navigate('/profile', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Page>
      <Navbar />

      <AuthContent className="container">
        <AuthPanel>
          <h1>{t('welcomeBack', { ns: 'auth' })}</h1>
          <GitHubSignIn />
          <Form
            noValidate
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <Input
              id="login-email"
              name="email"
              label={t('email', { ns: 'auth' })}
              type="email"
              placeholder={t('emailPlaceholder', { ns: 'auth' })}
              autoComplete="email"
              required
              onChange={() => setError('')}
            />

            <Input
              id="login-password"
              name="password"
              label={t('password', { ns: 'auth' })}
              type="password"
              placeholder={t('yourPassword', { ns: 'auth' })}
              autoComplete="current-password"
              required
              minLength={8}
              onChange={() => setError('')}
            />

            <Button type="submit">{t('logIn', { ns: 'auth' })}</Button>

            {isLoading && <p role="status">{t('loggingIn', { ns: 'auth' })}</p>}

            {error && <p role="alert">{error}</p>}
          </Form>

          <AuthHint>
            {t('noAccountYet', { ns: 'auth' })}{' '}
            <Link to="/register">{t('signUp', { ns: 'auth' })}</Link>
          </AuthHint>
        </AuthPanel>
      </AuthContent>

      <Footer />
    </Page>
  );
}

export default Login;

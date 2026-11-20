import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import fetchAPI from '../services/fetchAPI';
import type { AuthUser } from '../types/auth';
import Navbar from '../components/Navbar/Navbar';
import Form from '../components/Form/Form';
import GitHubSignIn from '../components/GitHubSignIn/GitHubSignIn';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import PasswordRequirements from '../components/PasswordRequirements/PasswordRequirements';
import Footer from '../components/Footer/Footer';
import { Page } from './Home/Home.styles';
import {
  AuthContent,
  AuthPanel,
  AuthHint,
  AuthSuccess,
} from './Login/Auth.styles';
import {
  validatePassword,
  PASSWORD_PATTERN,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../services/passwordValidation';

function Register() {
  const { t } = useTranslation('auth');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setError('');

    const form = event.currentTarget;
    const data = new FormData(form);

    const usernameValue = data.get('username');
    const emailValue = data.get('email');
    const passwordValue = data.get('password');
    const confirmationValue = data.get('confirmPassword');

    if (
      typeof usernameValue !== 'string' ||
      typeof emailValue !== 'string' ||
      typeof passwordValue !== 'string' ||
      typeof confirmationValue !== 'string'
    ) {
      setError(t('registrationFailed'));
      return;
    }

    const username = usernameValue.trim();
    const email = emailValue.trim();

    const passwordInput = form.elements.namedItem('password');
    const confirmationInput =
      form.elements.namedItem('confirmPassword');

    if (
      !(passwordInput instanceof HTMLInputElement) ||
      !(confirmationInput instanceof HTMLInputElement)
    ) {
      setError(t('registrationFailed'));
      return;
    }

    passwordInput.setCustomValidity('');
    confirmationInput.setCustomValidity('');

    if (!validatePassword(passwordValue).isValid) {
      passwordInput.setCustomValidity(t('passwordPatternMessage'));
    }

    if (passwordValue !== confirmationValue) {
      confirmationInput.setCustomValidity(t('passwordsDoNotMatch'));
    }

    if (!form.reportValidity()) return;

    if (username === '') {
      setError(t('enterUsername'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchAPI<AuthUser>({
        path: '/users',
        method: 'post',
        body: {
          username,
          email,
          password: passwordValue,
        },
      });

      if (response.error === true) {
        const message =
          typeof response.result === 'string'
            ? response.result
            : response.result.error;

        if (message === 'username already exists') {
          setError(t('usernameInUse'));
        } else if (message === 'email already exists') {
          setError(t('emailInUse'));
        } else if (message === 'value(s) already exists') {
          setError(t('usernameOrEmailInUse'));
        } else {
          setError(t('registrationFailed'));
        }

        return;
      }

      form.reset();
      setPassword('');
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Page>
      <Navbar />

      <AuthContent className="container">
        <AuthPanel>
          <h1>
            {success ? t('accountCreated') : t('createYourAccount')}
          </h1>

          {success ? (
            <AuthSuccess role="status">
              <p>{t('accountReadyToLogin')}</p>
              <Button to="/login">{t('logIn')}</Button>
            </AuthSuccess>
          ) : (
            <>
              <GitHubSignIn />
              <Form
                onSubmit={(event) => {
                  void handleSubmit(event);
                }}
              >
                <Input
                  id="register-username"
                  name="username"
                  label={t('username')}
                  type="text"
                  autoComplete="username"
                  placeholder={t('yourUsername')}
                  maxLength={32}
                  required
                />

                <Input
                  id="register-email"
                  name="email"
                  label={t('email')}
                  type="email"
                  autoComplete="email"
                  placeholder={t('emailPlaceholder')}
                  required
                />

                <Input
                  id="register-password"
                  name="password"
                  label={t('password')}
                  type="password"
                  autoComplete="new-password"
                  aria-describedby="password-help"
                  placeholder={t('examplePassword')}
                  pattern={PASSWORD_PATTERN}
                  title={t('passwordPatternMessage')}
                  value={password}
                  onChange={(event) => {
                    event.currentTarget.setCustomValidity('');
                    setPassword(event.currentTarget.value);
                  }}
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  required
                />

                <PasswordRequirements password={password} />

                <Input
                  id="register-confirm-password"
                  name="confirmPassword"
                  label={t('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('repeatYourPassword')}
                  onChange={(event) => {
                    event.currentTarget.setCustomValidity('');
                  }}
                  required
                />

                <Button type="submit">
                  {t('createAccount')}
                </Button>

                {isLoading && (
                  <p role="status">{t('creatingAccount')}</p>
                )}

                {error && <p role="alert">{error}</p>}
              </Form>
              <AuthHint>
                {t('alreadyHaveAnAccount')}{' '}
                <Link to="/login">{t('logIn')}</Link>
              </AuthHint>
            </>
          )}
        </AuthPanel>
      </AuthContent>

      <Footer />
    </Page>
  );
}

export default Register;
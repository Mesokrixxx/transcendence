import type { SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Form from '../components/Form/Form';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import PasswordRequirements from '../components/PasswordRequirements/PasswordRequirements';
import Footer from '../components/Footer/Footer';
import { Page } from './Home/Home.styles';
import { AuthContent, AuthPanel, AuthHint } from './Login/Auth.styles';
import {
  validatePassword,
  PASSWORD_PATTERN,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../services/passwordValidation';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const [password, setPassord] = useState('');
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const password = String(data.get('password') ?? '');
    const confirmation = String(data.get('confirmPassword') ?? '');

    const passwordInput = form.elements.namedItem(
      'password',
    ) as HTMLInputElement;

    const confirmationInput = form.elements.namedItem(
      'confirmPassword',
    ) as HTMLInputElement;

    passwordInput.setCustomValidity('');
    confirmationInput.setCustomValidity('');

    const validation = validatePassword(password);

    if (!validation.isValid) {
      passwordInput.setCustomValidity(
        t('passwordPatternMessage', { ns: 'auth' }),
      );
    }

    if (password !== confirmation) {
      confirmationInput.setCustomValidity(
        t('passwordsDoNotMatch', { ns: 'auth' }),
      );
    }

    if (!form.reportValidity()) {
      return;
    }

    //back
  }

  return (
    <Page>
      <Navbar />

      <AuthContent className="container">
        <AuthPanel>
          <h1>{t('createYourAccount', { ns: 'auth' })}</h1>

          <Form onSubmit={handleSubmit}>
            <Input
              id="register-username"
              name="username"
              label={t('username', { ns: 'auth' })}
              type="text"
              autoComplete="username"
              placeholder={t('yourUsername', { ns: 'auth' })}
              maxLength={32}
              required
            />

            <Input
              id="register-email"
              name="email"
              label={t('email', { ns: 'auth' })}
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder', { ns: 'auth' })}
              required
            />

            <Input
              id="register-password"
              name="password"
              label={t('password', { ns: 'auth' })}
              type="password"
              autoComplete="new-password"
              aria-describedby="password-help"
              placeholder={t('examplePassword', { ns: 'auth' })}
              pattern={PASSWORD_PATTERN}
              title={t('passwordPatternMessage', { ns: 'auth' })}
              value={password}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
                setPassord(event.currentTarget.value);
              }}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              required
            />
            <PasswordRequirements password={password} />

            <Input
              id="register-confirm-password"
              name="confirmPassword"
              label={t('confirmPassword', { ns: 'auth' })}
              type="password"
              autoComplete="new-password"
              placeholder={t('repeatYourPassword', { ns: 'auth' })}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
              }}
              required
            />

            <Button type="submit">{t('createAccount', { ns: 'auth' })}</Button>
          </Form>

          <AuthHint>
            {t('alreadyHaveAnAccount', { ns: 'auth' })}{' '}
            <Link to="/login">{t('logIn', { ns: 'auth' })}</Link>
          </AuthHint>
        </AuthPanel>
      </AuthContent>
      <Footer />
    </Page>
  );
}

export default Register;

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
      passwordInput.setCustomValidity(t('auth:passwordPatternMessage'));
    }

    if (password !== confirmation) {
      confirmationInput.setCustomValidity(t('auth:passwordsDoNotMatch'));
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
          <h1>{t('auth:createYourAccount')}</h1>

          <Form onSubmit={handleSubmit}>
            <Input
              id="register-username"
              name="username"
              label={t('auth:username')}
              type="text"
              autoComplete="username"
              placeholder={t('auth:yourUsername')}
              maxLength={32}
              required
            />

            <Input
              id="register-email"
              name="email"
              label={t('auth:email')}
              type="email"
              autoComplete="email"
              placeholder={t('auth:emailPlaceholder')}
              required
            />

            <Input
              id="register-password"
              name="password"
              label={t('auth:password')}
              type="password"
              autoComplete="new-password"
              aria-describedby="password-help"
              placeholder={t('auth:examplePassword')}
              pattern={PASSWORD_PATTERN}
              title={t('auth:passwordPatternMessage')}
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
              label={t('auth:confirmPassword')}
              type="password"
              autoComplete="new-password"
              placeholder={t('auth:repeatYourPassword')}
              onChange={(event) => {
                event.currentTarget.setCustomValidity('');
              }}
              required
            />

            <Button type="submit">{t('auth:createAccount')}</Button>
          </Form>

          <AuthHint>
            {t('auth:alreadyHaveAnAccount')}{' '}
            <Link to="/login">{t('auth:logIn')}</Link>
          </AuthHint>
        </AuthPanel>
      </AuthContent>
      <Footer />
    </Page>
  );
}

export default Register;

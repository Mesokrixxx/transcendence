import { useState } from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Field,
  Label,
  StyledInput,
  InputWrapper,
  PasswordToggle,
} from './Input.styles';

type InputProps = ComponentProps<'input'> & {
  id: string;
  label: string;
};

function Input({ id, label, type, ...props }: InputProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordVisible = type === 'password' && showPassword;
  const inputType = isPasswordVisible ? 'text' : type;
  const buttonText = isPasswordVisible
    ? t('auth:hidePassword')
    : t('auth:showPassword');
  const eyeIcon = isPasswordVisible
    ? '/icons/eye-slash-mdp.svg'
    : '/icons/eye-mdp.svg';

  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <InputWrapper>
        <StyledInput id={id} {...props} type={inputType} />
        {type === 'password' && (
          <PasswordToggle
            type="button"
            aria-label={buttonText}
            aria-controls={id}
            disabled={props.disabled}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            <img src={eyeIcon} alt="" />
          </PasswordToggle>
        )}
      </InputWrapper>
    </Field>
  );
}

export default Input;

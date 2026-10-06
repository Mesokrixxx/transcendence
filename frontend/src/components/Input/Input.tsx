import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Field, Label, StyledInput, InputWrapper, PasswordToggle } from './Input.styles'

type InputProps = ComponentProps<'input'> & {
  id: string
  label: string
}

function Input({ id, label, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  let inputType = type
  let buttonText = 'Show password'
  let eyeIcon = '/icons/eye-mdp.svg'

  if (type === 'password' && showPassword) {
    inputType = 'text'
    buttonText = 'Hide password'
    eyeIcon = '/icons/eye-slash-mdp.svg'
  }

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
          onClick={() => setShowPassword(!showPassword)}
        >
          <img src={eyeIcon} alt="" />
        </PasswordToggle>
      )}
      </InputWrapper>
    </Field>
  )
}

export default Input
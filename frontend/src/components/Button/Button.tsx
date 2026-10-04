import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StyledButton } from './Button.styles'

type ButtonProps = {
  children: ReactNode
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
}

function Button({ children, to, onClick, variant= 'primary'}: ButtonProps) {
  if (to !== undefined) {
    return (
      <StyledButton as={Link} to={to} $variant={variant}>
        {children}
      </StyledButton>
    )
  }

  return (
    <StyledButton type="button" onClick={onClick} $variant={variant}>
      {children}
    </StyledButton>
  )
}

export default Button
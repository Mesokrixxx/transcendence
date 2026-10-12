import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StyledButton } from './Button.styles'

type ButtonProps = {
  children: ReactNode
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
  type?: 'button' | 'submit' | 'reset'
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

function Button({ children, to, onClick, variant= 'primary', type ='button', 'aria-expanded': ariaExpanded, 'aria-controls': ariaControls}: 
  ButtonProps) {
  if (to !== undefined) {
    return (
      <StyledButton 
        as={Link} 
        to={to} 
        $variant={variant}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        >
        {children}
      </StyledButton>
    )
  }

  return (
    <StyledButton 
      type={type} 
      onClick={onClick} 
      $variant={variant}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      >
      {children}
    </StyledButton>
  )
}

export default Button
import styled from 'styled-components'

type StyledButtonProps = {
  $variant: 'primary' | 'secondary' | 'accent'
}

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;

  background-color: ${({ $variant }) => {
    if ($variant === 'secondary') {
      return 'transparent'
    }

    if ($variant === 'accent') {
      return 'var(--color-accent)'
    }

    return 'var(--color-primary)'
  }};

  border: 2px solid ${({ $variant }) => {
    if ($variant === 'secondary') {
      return 'var(--color-primary)'
    }

    return 'transparent'
  }};

  border-radius: 10px;

  && {
    color: ${({ $variant }) => {
      if ($variant === 'secondary') {
        return 'var(--color-primary)'
      }

      return 'var(--color-background)'
    }};

    text-decoration: none;
  }

  font-weight: 600;
  cursor: pointer;
  transition: transform 150ms ease;

  &:hover {
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`
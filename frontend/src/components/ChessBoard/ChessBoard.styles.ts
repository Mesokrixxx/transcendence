import styled from 'styled-components';

export const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  grid-template-rows: repeat(8, minmax(0, 1fr));
  width: 100%;
  max-width: min(900px, 90dvh);
  aspect-ratio: 1/1;
  box-sizing: border-box;

  border: 4px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 900px) {
    width: min(100%, 600px, 65dvh);
    max-width: none;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
  }
`;

type SquareProps = {
  $isLight: boolean;
  $selected: boolean;
};

export const Square = styled.button<SquareProps>`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border: none;
  appearance: none;
  cursor: pointer;

  background-color: ${({ $isLight }) => {
    if ($isLight) {
      return 'var(--color-board-light)';
    }

    return 'var(--color-board-dark)';
  }};

  box-shadow: ${({ $selected }) => {
    if ($selected) {
      return 'inset 0 0 0 3px var(--color-primary)';
    }

    return 'none';
  }};

  img {
    transform: ${({ $selected }) => {
      if ($selected) {
        return 'translateY(-4px) scale(1.08)';
      }

      return 'none';
    }};
  }

  &:disabled {
    cursor: default;
  }

  &:focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: -3px;
  }

  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
      transform: none;
    }
  }
`;

export const Piece = styled.img`
  width: 85%;
  height: 85%;
  object-fit: contain;
  user-select: none;
  transition: transform 150ms ease;
`;

export const MoveIndicator = styled.span<{ $capture: boolean }>`
  position: absolute;
  z-index: 1;
  pointer-events: none;
  border-radius: 50%;
  border-sizing: border-box;
  color: var(--color-background);

  width: ${({ $capture }) => {
    if ($capture) return '88%';
    return '24%';
  }};

  height: ${({ $capture }) => {
    if ($capture) return '88%';
    return '24%';
  }};

  background: ${({ $capture }) => {
    if ($capture) return 'transparent';
    return 'currentColor';
  }};

  border: ${({ $capture }) => {
    if ($capture) return '4px solid currentColor';
    return 'none';
  }};

  opacity: ${({ $capture }) => {
    if ($capture) return 0.55;
    return 0.35;
  }};
`;

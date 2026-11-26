import styled from 'styled-components';

export const ProgressCard = styled.section`
  margin-block: 24px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);

  h2 {
    margin: 0 0 8px;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
    list-style: none;
  }

  h3 {
    margin: 20px 0 10px;
  }
`;

export const BadgeList = styled.ul`
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  grid-auto-rows: 1fr;
  gap: 12px !important;

  & > li {
    display: flex;
    min-width: 0;
  }
`;

export const BadgeButton = styled.button<{ $featured: boolean }>`
  width: 100%;
  min-height: 92px;
  padding: 14px 16px;
  border: 2px solid
    ${({ $featured }) =>
      $featured ? 'var(--color-accent)' : 'var(--color-primary)'};
  border-radius: 10px;
  background: ${({ $featured }) =>
    $featured
      ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
      : 'color-mix(in srgb, var(--color-primary) 10%, transparent)'};
  color: var(--color-primary);
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: ${({ disabled }) => (disabled ? 'help' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
  transition:
    transform 150ms ease,
    background-color 150ms ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: translateY(-3px);
    background: color-mix(in srgb, var(--color-primary) 18%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      transform: none;
    }
  }
`;

export const BadgeStat = styled.span`
  display: block;
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 400;
`;

export const Achievement = styled.li<{ $unlocked: boolean }>`
  opacity: ${({ $unlocked }) => ($unlocked ? 1 : 0.5)};
`;

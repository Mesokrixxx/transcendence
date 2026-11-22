import styled from 'styled-components';

export const FeaturedBadges = styled.div`
  margin-top: 24px;

  h2 {
    margin: 0 0 12px;
    color: var(--color-primary);
    font-size: 1.1rem;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding: 10px 14px;
    border: 2px solid var(--color-primary);
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
    font-weight: 600;
  }

  small {
    display: block;
    margin-top: 4px;
    color: var(--color-text-secondary);
    font-weight: 400;
  }
`;
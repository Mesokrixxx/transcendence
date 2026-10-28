import styled from 'styled-components';

export const ProfilePanel = styled.section`
  margin: 48px 0;
  padding: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  h1 {
    margin: 0;
    color: var(--color-text-primary);
  }

  p {
    margin: 8px 0 0;
    color: var(--color-text-secondary);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .profile-info {
      flex: none;
      width: 100%;
      text-aligne: center;
    }
  }
`;

export const AvatarUpload = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-top: 24px;

  label {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  input[type='text'] {
    box-sizing: border-box;
    width: 100%;
    max-width: 440px;
    padding: 12px 16px;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-text-primary);
    font: inherit;
  }

  input {
    max-width: 100%;
    color: var(--color-text-primary);
  }

  input:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  #avatar-error {
    color: var(--color-text-primary);
  }
`;

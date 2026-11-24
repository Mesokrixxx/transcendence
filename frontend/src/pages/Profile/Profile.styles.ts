import styled from 'styled-components';

export const ProfilePanel = styled.section`
  margin: 48px 0 24px;
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
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .profile-info h1 {
    margin: 0;
    line-height: 1.2;
    color: var(--color-text-primary);
  }

  .profile-info p {
    margin: 0;
    line-height: 1.4;
    color: var(--color-text-secondary);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .profile-info {
      flex: none;
      width: 100%;
      text-align: center;
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

export const ProfileStatus = styled.section`
  margin: 48px 0 24px;
  padding: 48px 32px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  text-align: center;
`;

export const ProfileStatusContent = styled.h2`
  margin: 0;
  color: var(--color-text-primary);
  font-size: 20px;
`;

export const ProfileActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 1000px) {
    flex-direction: column;
  }

  @media (max-width: 600px) {
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }
`;

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


export const ProfileDialog = styled.dialog`
  box-sizing: border-box;
  width: min(560px, calc(100% - 32px));
  max-height: calc(100dvh - 48px);
  margin: auto;
  padding: 24px;
  overflow-y: auto;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 16px;

  &::backdrop {
    background: rgb(0 0 0 /65%);
  }

  .profile-username-display {
  cursor: default;
  opacity: 0.7;
  }

  .profile-username-display p {
    margin: 0.5rem 0 0;
    padding: 0.75rem 1rem;
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    border-radius: 0.5rem;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  @media (max-width: 600px) {
    padding: 20px;
  }

  form{
    margin-top: 24px;
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .avatar-editor {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .avatar-editor > :last-child {
    flex: 1;
    min-width: 0;
  }

  .profile-help {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 13px;
  }
`

export const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: var(--color-primary);
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    padding: 0;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-text-primary);
    font-size: 28px;
    cursor: pointer;

    &:hover {
      background: var(--color-background);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 3px;
    }
  }
`;

export const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;
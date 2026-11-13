export async function uploadAvatar(file: File): Promise<string> {
  const body = new FormData();
  body.append('avatar', file);

  const response = await fetch('/api/users/me/avatar', {
    method: 'POST',
    credentials: 'include',
    body,
  });

  if (!response.ok) {
    throw new Error('Avatar upload failed');
  }

  const result: unknown = await response.json();

  if (
    typeof result !== 'object' ||
    result === null ||
    !('avatar' in result) ||
    typeof result.avatar !== 'string' ||
    !result.avatar.startsWith('/api/avatars/')
  ) {
    throw new Error('Invalid avatar response');
  }

  return result.avatar;
}
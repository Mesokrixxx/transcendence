import fetchAPI from './fetchAPI';

export async function updateProfileDisplayName(displayName: string) {
  const name = displayName.trim();

  if (!name || name.length > 32) {
    throw new Error('Invalid display name');
  }

  const response = await fetchAPI({
    path: '/users/me',
    method: 'patch',
    body: { displayName: name },
  });

  if (response.error) {
    throw new Error('Profile update failed');
  }
}
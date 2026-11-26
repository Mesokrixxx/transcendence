import fetchAPI from './fetchAPI';

export async function updateProfileDisplayName(displayName: string) {
  const name = displayName.trim();

  const response = await fetchAPI({
    path: '/users/me',
    method: 'patch',
    body: { displayName: name || null },
  });

  if (response.error) {
    throw new Error('Profile update failed');
  }
}
